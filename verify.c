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

#include <sys/types.h>
#include <pwd.h>
#include <string.h>

#include <dirent.h>

#include <libfprint/fprint.h>

#include <sqlite3.h>


// CALLBACKS for sqlite3 ***********************************************************************
static int get_int(void *data, int argc, char **argv, char **azColName){
    int *result = (int *)data;
    *result = (argv[0]) ? atoi(argv[0]) : -1 ; 
   return (argv[0]) ? 0 : -1  ;
}



int verify_user_and_log(int finger_id)
{

	sqlite3 * db; char * zErrMsg; char * sql;


	char * dblocale = (char * ) malloc(256);

	strcpy(dblocale, "/digitais/database.db");
	int rc;
	int temp;
	int *userid = (int*) malloc(sizeof(int));

	
	rc = sqlite3_open(dblocale, & db);
	free(dblocale);
	if (rc) {
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		return (0);
	} else
		printf( "Opened database successfully\n ");
	sql = (char *) malloc(512);
	sprintf(sql, "SELECT userid FROM `fingerprints` WHERE fingerprint_id = '%d'; ", finger_id);

	rc = sqlite3_exec(db, sql, get_int, userid, &zErrMsg);

	if (rc != SQLITE_OK) {
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		free(userid);
		sqlite3_close(db);
		return -1;	
	}

	if(*userid == -1)
	{
		free(sql);
		free(userid);
		sqlite3_close(db);
		return -1;
	}

	sprintf(sql, "INSERT INTO log (userid,  date) VALUES(%d,  datetime('now', 'localtime')); ", *userid);
	rc = sqlite3_exec(db, sql, NULL, NULL, & zErrMsg);
	if (rc != SQLITE_OK) {
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		free(userid);
		free(sql);
		return -1;
	}
	temp = *userid;
	free(userid);
	free(sql);
	sqlite3_close(db);
	return temp;

}


struct fp_print_data **dataGallery; //Vetor de ponteiros de digital!
int *filesnumbers;
int qtd = 0; //quantidade de digitais carregadas!

struct fp_dscv_dev *discover_device(struct fp_dscv_dev **discovered_devs)
{
	struct fp_dscv_dev *ddev = discovered_devs[0];
	struct fp_driver *drv;
	if (!ddev)
		return NULL;
	
	drv = fp_dscv_dev_get_driver(ddev);
	printf("Found device claimed by %s driver\n", fp_driver_get_full_name(drv));
	return ddev;
}

struct fp_print_data *enroll(struct fp_dev *dev) {
	struct fp_print_data *enrolled_print = NULL;
	int r;

	set_nr_enroll_stages(dev);
	printf("You will need to successfully scan your finger %d times to "
		"complete the process.\n", fp_dev_get_nr_enroll_stages(dev));

	do {
		struct fp_img *img = NULL;
	
		sleep(1);
		printf("\nScan your finger now.\n");
		
		r = fp_enroll_finger_img(dev, &enrolled_print, &img);
		if (img) {
			fp_img_free(img);
		}
		if (r < 0) {
			printf("Enroll failed with error %d\n", r);
			return NULL;
		}
		printf("ERRE VALE %d\n\n", r);

		switch (r) {
		case FP_ENROLL_COMPLETE:
			printf("Enroll complete!\n");
			break;
		case FP_ENROLL_FAIL:
			printf("Enroll failed, something wen't wrong :(\n");
			return NULL;
		case FP_ENROLL_PASS:
			printf("Enroll stage passed. Yay!\n");
			break;
		case FP_ENROLL_RETRY:
			printf("Didn't quite catch that. Please try again.\n");
			break;
		case FP_ENROLL_RETRY_TOO_SHORT:
			printf("Your swipe was too short, please try again.\n");
			break;
		case FP_ENROLL_RETRY_CENTER_FINGER:
			printf("Didn't catch that, please center your finger on the "
				"sensor and try again.\n");
			break;
		case FP_ENROLL_RETRY_REMOVE_FINGER:
			printf("Scan failed, please remove your finger and then try "
				"again.\n");
			break;
		}
	} while (r != FP_ENROLL_COMPLETE);

	if (!enrolled_print) {
		fprintf(stderr, "Enroll complete but no print?\n");
		return NULL;
	}

	printf("Enrollment completed!\n\n");
	return enrolled_print;
}

int load_fingerprints(struct fp_dev *dev){
	struct passwd *pw = getpwuid(getuid());
    const char *homedir = pw->pw_dir;
    char target[512];
    strcpy(target,homedir);
    strcat(target, "/.fprint/prints/0002/00000000");
    int i = 0;

    struct dirent *de;  // Pointer for directory entry
 
    // opendir() returns a pointer of DIR type. 
    DIR *dr = opendir(target);

    //Reseta quantidade de digital
    qtd = 0;
 
    if (dr == NULL)  // opendir returns NULL if couldn't open directory
    {
        printf("Could not open current directory" );
        return 1;
    }
 
    // Refer http://pubs.opengroup.org/onlinepubs/7990989775/xsh/readdir.html
    // for readdir()
    while ((de = readdir(dr)) != NULL)
    	i++;

    i-=2;
    dataGallery = (struct fp_print_data **) malloc( i * sizeof(struct fp_print_data *));
    filesnumbers = (int*) malloc( i * sizeof(int));   
    dr = opendir(target);
    while ((de = readdir(dr)) != NULL)
        if(de->d_name[0] != '.' && strlen(de->d_name) == 3){
            fp_print_data_load(dev, (int) strtol(de->d_name, NULL, 16), &dataGallery[qtd]);
            filesnumbers[qtd] = (int) strtol(de->d_name, NULL, 16);
            qtd++;
        }
 
    closedir(dr); 

    return 0;
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
		fprintf(stderr, "Failed to initialize libfprint\n");
		exit(1);
	}
	fp_set_debug(3);

	discovered_devs = fp_discover_devs();
	if (!discovered_devs) {
		fprintf(stderr, "Could not discover devices\n");
		goto out;
	}

	ddev = discover_device(discovered_devs);
	if (!ddev) {
		fprintf(stderr, "No devices detected.\n");
		goto out;
	}

	dev = fp_dev_open(ddev);
	fp_dscv_devs_free(discovered_devs);
	if (!dev) {
		fprintf(stderr, "Could not open device.\n");
		goto out;
	}

	printf("Opened device. Loading previously enrolled right index finger "
		"data...\n");

	//Carrega digitais!
	r = load_fingerprints(dev);
	if (r != 0) {
		fprintf(stderr, "Failed to load fingerprint, error %d\n", r);
		fprintf(stderr, "Did you remember to enroll your right index finger "
			"first?\n");
		goto out_close;
	}

	//Inicia leitura
	do {
		//Faz uma leitura de digital e salva em *data!
		data = enroll(dev);
		printf("Waiting for finger in leitor.\n\n");
		if (!data)
			goto out_close;

		//Verifica as digitais carregadas com a lida!
		i = 0;
		while(i < qtd){
			r = verify_process(dataGallery[i], data);

			if (r >= 76){
				
				r = verify_user_and_log(filesnumbers[i]);
				if(r!=-1)
				{
					system("/bin/abrir_porta");
				}
				 
				
				break;
			} 

			i++;
		}
		fp_print_data_free(data);
	} while (1);

	fp_print_data_free(data);
out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	return r;
}


