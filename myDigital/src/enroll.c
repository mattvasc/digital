/*
 * Example fingerprint enrollment program
 * Enrolls your right index finger and saves the print to disk
 * Copyright (C) 2007 Daniel Drake <dsd@gentoo.org>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <dirent.h>
#include <string.h>
#include <ctype.h>

#include <libfprint/fprint.h>

char name[50];
char *ans;
char renameHome[150];

struct fp_dscv_dev *discover_device(struct fp_dscv_dev **discovered_devs)
{
	struct fp_dscv_dev *ddev = discovered_devs[0];
	struct fp_driver *drv;
	if (!ddev)
		return NULL;
	
	drv = fp_dscv_dev_get_driver(ddev);
	printf("Dispositivo encontrado reivindicado por %s driver!\n", fp_driver_get_full_name(drv));
	return ddev;
}

struct fp_print_data *enroll(struct fp_dev *dev) {
	struct fp_print_data *enrolled_print = NULL;
	int r;

	printf("Você precisará escanear sua digital com sucesso %d vezes para "
		"completar o processo!.\n", fp_dev_get_nr_enroll_stages(dev));

	do {
		struct fp_img *img = NULL;
	
		sleep(1);
		printf("\nScan Iniciado!.\n");

		r = fp_enroll_finger_img(dev, &enrolled_print, &img);
		if (img) {
			//fp_img_save_to_file(img, "enrolled.pgm");
			//printf("Imagem gravada: enrolled.pgm\n");
			fp_img_free(img);
		}
		if (r < 0) {
			printf("Erro na leitura %d!\n", r);
			return NULL;
		}

		switch (r) {
		case FP_ENROLL_COMPLETE:
			printf("Leitura realizada com sucesso!\n");
			break;
		case FP_ENROLL_FAIL:
			printf("A leitura falhou :(\n");
			return NULL;
		case FP_ENROLL_PASS:
			printf("Quase lá. Yay!\n");
			break;
		case FP_ENROLL_RETRY:
			printf("Não entendi muito bem isso. Por favor tente novamente!\n");
			break;
		case FP_ENROLL_RETRY_TOO_SHORT:
			printf("Seu swipe foi muito rapido. Por favor tente novamente!\n");
			break;
		case FP_ENROLL_RETRY_CENTER_FINGER:
			printf("Não entendi muito bem isso. Por favor coloque seu dedo mais no centro do sensor e tente novamente!\n");
			break;
		case FP_ENROLL_RETRY_REMOVE_FINGER:
			printf("Scan falhou, remova o dedo do sensor e tente novamente!\n");
			break;
		}
	} while (r != FP_ENROLL_COMPLETE);

	if (!enrolled_print) {
		fprintf(stderr, "Leitura completa mas não imprimiu?\n");
		return NULL;
	}

	printf("Leitura completa!\n\n");
	return enrolled_print;
}


char* folder_name(){
//	struct dirent **namelist;
//	int n = scandir("/home/furukawa/.fprint/", &namelist, 0, alphasort);
	int i = 0;
	
	if(!strlen(name)) return NULL;
/*
	if(n < 0) perror("scandir");
	else {
		while(n--){
			if(!strcmp(namelist[n]->d_name, name)) return NULL;
			free(namelist[n]);
		}
		free(namelist);
	}
*/
	i = 0;
	while(i < strlen(name)){
		if(!isalpha(name[i])) 
			name[i] = '_';
		i++;
	}

	return name;
}

int main(void)
{
	int r = 1, i = 0;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	struct fp_dev *dev;
	struct fp_print_data *data;

	r = fp_init();
	if (r < 0) {
		fprintf(stderr, "Falha ao inicializar a libfprint!\n");
		exit(1);
	}

	discovered_devs = fp_discover_devs();
	if (!discovered_devs) {
		fprintf(stderr, "Não foi possível descobrir dispositivos!\n");
		goto out;
	}

	ddev = discover_device(discovered_devs);
	if (!ddev) {
		fprintf(stderr, "Dispositivos não detectados!\n");
		goto out;
	}

	dev = fp_dev_open(ddev);
	fp_dscv_devs_free(discovered_devs);
	if (!dev) {
		fprintf(stderr, "Não foi possível abrir o dispositivo!\n");
		goto out;
	}

	printf("Dispositivo aberto! Agora é hora de se registrar.\n\n");
	printf("Antes de começarmos, diga o seu nome completo (Somente caracteres!): ");
	scanf("%[^\n]s", name);
	printf("\n");
	ans = folder_name();

	if(ans == NULL){
		printf("Insira um nome válido!\n");
		return 0;
	}

	i = 1;
	while (i < 3){
		//Clear string
		strcpy(renameHome, "");

		data = enroll(dev);
		if (!data)
			goto out_close;

		r = fp_print_data_save(data, i);
		if (r < 0)
			fprintf(stderr, "Falha ao salvar dados, codigo: %d\n", r);

		//rename ~/.fprint/prints/num_finger
		strcpy(renameHome, "mv ../../prints/0002/00000000/");
		strcat(renameHome, (i == 1 ? "1 ../../prints/0002/00000000/0_1_" : "2 ../../prints/0002/00000000/0_2_"));
		strcat(renameHome, ans);
		
		system(renameHome);

		i++;
	}

	fp_print_data_free(data);
out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	return r;
}