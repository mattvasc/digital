
// Compile with the flags: -lfprint -l sqlite3

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pwd.h>
#include <sys/types.h>
#include <libfprint/fprint.h>
#include <string.h>
#include <sqlite3.h> 


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

	printf("You will need to successfully scan your finger %d times to "
		"complete the process.\n", fp_dev_get_nr_enroll_stages(dev));

	do {
		struct fp_img *img = NULL;
	
		sleep(1);
		printf("\nScan your finger now.\n");

		r = fp_enroll_finger_img(dev, &enrolled_print, &img);
		if (img) {
			fp_img_save_to_file(img, "enrolled.pgm");
			printf("Wrote scanned image to enrolled.pgm\n");
			fp_img_free(img);
		}
		if (r < 0) {
			printf("Enroll failed with error %d\n", r);
			return NULL;
		}

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

// CALLBACKS for sqlite3 ***********************************************************************
static int get_int(void *data, int argc, char **argv, char **azColName){
    int *result = (int *)data;
    *result = (argv[0]) ? atoi(argv[0]) : 0 ; 
   return (argv[0]) ? 0 : -1  ;
}



// ********************************************************************************************
int create_user() {

	sqlite3 * db;
	int rc;
	int * count = (int * ) malloc(sizeof(int));
	int user_id;
	char * zErrMsg;
	char * sql; 
	char * dblocale = (char * ) malloc(256);
	char username[128] = "",	email[256] = "",	phone[64] = "";

	
	strcpy(dblocale, "/fingerprints/database.db");

	rc = sqlite3_open(dblocale, & db);
	free(dblocale);
	if (rc) {
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		return (0);
	} else
		fprintf(stderr, "Opened database successfully\n\nPlease supply your name: ");

	
	fgets(username, 127, stdin);
	printf("email: ");
	fgets(email, 255, stdin);
	printf("phone (enter for none): ");
	fgets(phone, 63, stdin);

	username[strlen(username) - 1] = '\0';
	email[strlen(email) - 1] = '\0';
	phone[strlen(phone) - 1] = '\0';
	if(!strlen(email) || !strlen(username)){
		fprintf(stderr, "ERROR PLEASE INPUT NAME AND EMAIL!\n\n");
		return -1;
	}
	sql = malloc(512);
	//TODO: SQL INJECTION PROTECTION
	sprintf(sql, "INSERT INTO `user`(name, email, phone) VALUES( '%s', '%s', '%s' ); ", username, email, phone);
	rc = sqlite3_exec(db, sql, NULL, NULL, & zErrMsg);

	if (rc != SQLITE_OK) {
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		user_id = -1;
	} else {
		sprintf(sql, "SELECT id FROM `user` WHERE name = '%s' AND email = '%s'; ", username, email);
		rc = sqlite3_exec(db, sql, get_int, count, &zErrMsg);
		if (rc != SQLITE_OK) {
			fprintf(stderr, "SQL error: %s\n", zErrMsg);
			sqlite3_free(zErrMsg);
			user_id = -1;
		} else {

			user_id = * count;
			free(count);
			sprintf(sql, "INSERT INTO `fingerprints`(userid, fingerprint_id) VALUES( %d, '%d' ); ", user_id, user_id);
			rc = sqlite3_exec(db, sql, NULL, NULL, & zErrMsg);
			if (rc != SQLITE_OK) {
				fprintf(stderr, "SQL error: %s\n", zErrMsg);
				sqlite3_free(zErrMsg);
				user_id = -1;
			}
		}
	}

	free(sql);
	sqlite3_close(db);

	return user_id;

}

void update_user(){
 //... TODO
}

int main(void)
{
	
	int r = 1;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	struct fp_dev *dev;
	struct fp_print_data *data;

    int finger_id;
    
	finger_id = create_user();
    
	printf("Record now your finger, press CTRL+C to cancel\n");


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

	printf("Opened device. It's now time to enroll your finger.\n\n");

	data = enroll(dev);
	if (!data)
		goto out_close;

	printf("Going to save a new user with the finger_id: %d\n", finger_id);
	
	r = fp_print_data_save(data, finger_id);
		
	if (r < 0)
		fprintf(stderr, "Data save failed, code %d\n", r);
	
	fp_print_data_free(data);
out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	return r;
}

