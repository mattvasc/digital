/*
 * Example fingerprint verification program, which verifies the right index
 * finger which has been previously enrolled to disk.
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

char userHost[150];
char hostUser[150];
char saveHome[150];

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

int verify(struct fp_dev *dev, struct fp_print_data *data)
{
	int r;

	do {
		struct fp_img *img = NULL;

		sleep(1);
		printf("\nScan Iniciado!.\n");
		r = fp_verify_finger_img(dev, data, &img);
		if (img) {
			//fp_img_save_to_file(img, "verify.pgm");
			//printf("Imagem gravada: verify.pgm\n");
			fp_img_free(img);
		}
		if (r < 0) {
			printf("Erro na leitura %d!\n", r);
			return r;
		}
		switch (r) {
		case FP_VERIFY_NO_MATCH:
			printf("Não compatível!\n");
			return 0;
		case FP_VERIFY_MATCH:
			printf("compatível!\n");
			return 0;
		case FP_VERIFY_RETRY:
			printf("Não entendi muito bem isso. Por favor tente novamente!\n");
			break;
		case FP_VERIFY_RETRY_TOO_SHORT:
			printf("Seu swipe foi muito rapido. Por favor tente novamente!\n");
			break;
		case FP_VERIFY_RETRY_CENTER_FINGER:
			printf("Não entendi muito bem isso. Por favor coloque seu dedo mais no centro do sensor e tente novamente!\n");
			break;
		case FP_VERIFY_RETRY_REMOVE_FINGER:
			printf("Scan falhou, remova o dedo do sensor e tente novamente!\n");
			break;
		}
	} while (1);
}

int main(void)
{
	int r = 1;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	struct fp_dev *dev;
	struct fp_print_data *data;

	struct dirent **namelist;
	int n = scandir("../../prints/0002/00000000/", &namelist, 0, alphasort);

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

	do {
		n = scandir("../../prints/0002/00000000/", &namelist, 0, alphasort);

		if(n < 0) perror("scandir");
		else {
			while(n--){
				if(!strcmp(namelist[n]->d_name, "..") || !strcmp(namelist[n]->d_name, ".")){
					free(namelist[n]);
					continue;
				}
				
				//clear strings
				strcpy(userHost,"");
				strcpy(hostUser,"");
				strcpy(saveHome,"");

				//backup name
				strcpy(saveHome, namelist[n]->d_name);

				//rename ~/.fprint/prints/1
				strcpy(userHost, "mv ../../prints/0002/00000000/");
				strcat(userHost, namelist[n]->d_name);
				strcat(userHost, " ../../prints/0002/00000000/1");
				system(userHost);

				//printf("%s\n",namelist[n]->d_name);
				r = fp_print_data_load(dev, 1, &data);
				if (r != 0) {
					fprintf(stderr, "Falha ao carregar a digital!");
					goto out_close;
				}
				verify(dev, data);

				//rename ~/.fprint/prints/num_finger
				strcpy(hostUser, "mv ../../prints/0002/00000000/");
				strcat(hostUser, "1 ../../prints/0002/00000000/");
				strcat(hostUser, saveHome);
				system(hostUser);

				//free
				free(namelist[n]);
			}

			free(namelist);
		}
				
	} while (1);

	fp_print_data_free(data);
out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	return r;
}


