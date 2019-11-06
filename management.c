
// Compile with the flags: -lfprint -l sqlite3
// gcc management.c -o management -lsqlite3 -lfprint

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pwd.h>
#include <sys/types.h>
#include <libfprint/fprint.h>
#include <string.h>
#include <sqlite3.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/wait.h>

struct fp_dev *dev;
struct fp_print_data *data;

sqlite3 *db;
char *zErrMsg;

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

struct fp_print_data *enroll(struct fp_dev *dev)
{
	struct fp_print_data *enrolled_print = NULL;
	int r;

	printf("You will need to successfully scan your finger %d times to "
		   "complete the process.\n",
		   fp_dev_get_nr_enroll_stages(dev));

	do
	{
		struct fp_img *img = NULL;

		sleep(1);
		printf("\nScan your finger now.\n");

		r = fp_enroll_finger_img(dev, &enrolled_print, &img);
		if (img)
		{
			fp_img_save_to_file(img, "enrolled.pgm");
			printf("Wrote scanned image to enrolled.pgm\n");
			fp_img_free(img);
		}
		if (r < 0)
		{
			printf("Enroll failed with error %d\n", r);
			return NULL;
		}

		switch (r)
		{
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

	if (!enrolled_print)
	{
		fprintf(stderr, "Enroll complete but no print?\n");
		return NULL;
	}

	printf("Enrollment completed!\n\n");
	return enrolled_print;
}

// CALLBACKS for sqlite3 ***********************************************************************
static int get_int(void *data, int argc, char **argv, char **azColName)
{
	int *result = (int *)data;
	*result = (argv[0]) ? atoi(argv[0]) : 0;
	return (argv[0]) ? 0 : -1;
}

static int print_table(void *data, int argc, char **argv, char **azColName)
{
	int *result = (int *)data;
	*result = (argv[0]) ? atoi(argv[0]) : 0;
	return 0;
}

// ********************************************************************************************
int create_user()
{

	int rc, aux1, aux2;
	int *count = (int *)malloc(sizeof(int));
	int user_id;

	char *sql;

	char username[128] = "", email[256] = "", phone[64] = "";

	printf("\nPlease supply your name: ");

	fgets(username, 127, stdin);
	printf("email: ");
	fgets(email, 255, stdin);
	printf("phone (enter for none): ");
	fgets(phone, 63, stdin);

	username[strlen(username) - 1] = '\0';
	email[strlen(email) - 1] = '\0';
	phone[strlen(phone) - 1] = '\0';
	if (!strlen(email) || !strlen(username))
	{
		fprintf(stderr, "ERROR PLEASE INPUT NAME AND EMAIL!\n\n");
		return -1;
	}
	sql = malloc(512);
	//TODO: SQL INJECTION PROTECTION
	sprintf(sql, "INSERT INTO `user`(name, email, phone) VALUES( '%s', '%s', '%s' ); ", username, email, phone);
	rc = sqlite3_exec(db, sql, NULL, NULL, &zErrMsg);

	if (rc != SQLITE_OK)
	{
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		user_id = -1;
	}
	else
	{
		sprintf(sql, "SELECT id FROM `user` WHERE name = '%s' AND email = '%s'; ", username, email);
		rc = sqlite3_exec(db, sql, get_int, count, &zErrMsg);
		if (rc != SQLITE_OK)
		{
			fprintf(stderr, "SQL error: %s\n", zErrMsg);
			sqlite3_free(zErrMsg);
			user_id = -1;
		}
		else
		{

			user_id = *count;
			free(count);

			while (1)
			{
				printf("Please inform what finger will be enroled:\n");
				printf("1)Left Thumb\t2)Right Thumb\n3)Left Index\t4)Right Index\n5)Left Middle\t6)Right Middle\n7)Left Ringer\t8)Right Ringer\n9)Left Pinkie\t10)Right Pinkie\nSelected Option: ");
				aux2 = scanf("%d%*c", &aux1);
				if (aux2 && aux1 >= 1 && aux1 <= 10)
					break;
				printf("Didn't Understand, please try again...\n");
			}
			printf("It's now time to enroll your finger.\n\n");
			data = enroll(dev);
			if (!data)
			{
				fp_dev_close(dev);
				fp_exit();
				printf("There was an error while enrolling the user fingerprint!!");
				exit(1);
			}

			sprintf(sql, "INSERT INTO `fingerprints`(userid, fingerprint_id, finger) VALUES( %d, %d, %d ); ", user_id, user_id, aux1);
			rc = sqlite3_exec(db, sql, NULL, NULL, &zErrMsg);
			if (rc != SQLITE_OK)
			{
				fprintf(stderr, "SQL error: %s\n", zErrMsg);
				sqlite3_free(zErrMsg);
				user_id = -1;
			}
		}
	}

	free(sql);

	printf("Going to save a new user with the user_id: %d\n", user_id);

	rc = fp_print_data_save(data, user_id, aux1);

	if (rc < 0)
		fprintf(stderr, "Data save failed, code %d\n", rc);

	fp_print_data_free(data);

	return user_id;
}

//Ask for user info, and return userid
int select_user()
{
	//TODO
	char username[64], *p, sql[128];
	int rc;
	printf("Inform the full or a part of the person name (enter for all): ");
	fgets(username, 63, stdin);
	username[strlen(username) - 1] = '\0';
	for (p = username; *p; p++)
		*p = tolower(*p); //str2lower

	sprintf("SELECT * FROM `user` WHERE name LIKE '%%%s%%' ORDER BY name ASC;", username);
	// PASSAR COMO PARAMETRO AO CALLBACK UMA LISTA LIGADA zzzzzzzzzzz
	rc = sqlite3_exec(db, sql, print_table, NULL, &zErrMsg);
	if (rc != SQLITE_OK)
	{
		printf("ERROR: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		return -1;
	}

	/*
		fgets name
		search for name in sqlite
		printf which one is the user?
		return userid
	*/
	return 0;
}

void update_user()
{
	//TODO
	int userid;
	userid = select_user();
	if (userid > 0)
		userid = 0;
}
void add_fingerprint()
{
	//TODO
}
void delete_user()
{
	//TODO:
	int userid;
	userid = select_user();
	if (userid > 0)
		userid = 0;
}

int main(void)
{

	int r = 0;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	pid_t child_pid;

	if (!getenv("SUDO_UID"))
	{
		printf("\nError! The program must run with sudo privileges!\n\n");
		return -1;
	}

	printf("*** Welcome to the Fingerprint System!***\n\n");
	char *command = "service";

	child_pid = fork();

	if (child_pid == 0)
	{
		/* This is done by the child process. */

		char *arguments[] = {"service", "digital", "stop", NULL};
		execvp(command, arguments);
	}
	else
	{
		/* This is run by the parent.  Wait for the child
        to terminate. */
		printf("Stopping the daemon of verifying...\n");
		waitpid(child_pid, &r, 0);
		printf("Daemon stopped sucefully!\n\n");
	}

	char *dblocale = (char *)malloc(256);
	strcpy(dblocale, "./database.db");
	r = sqlite3_open(dblocale, &db);

	free(dblocale);

	if (r)
	{
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		exit(1);
	}

	r = fp_init();

	if (r < 0)
	{
		fprintf(stderr, "Failed to initialize libfprint\n");
		exit(1);
	}

	fp_set_debug(3);
	discovered_devs = fp_discover_devs();

	if (!discovered_devs)
	{
		fprintf(stderr, "Could not discover devices, maybe permission issue?\n");
		goto out;
	}

	ddev = discover_device(discovered_devs);

	if (!ddev)
	{
		fprintf(stderr, "No devices detected, aborting.\n");
		goto out;
	}

	dev = fp_dev_open(ddev);
	fp_dscv_devs_free(discovered_devs);

	if (!dev)
	{
		fprintf(stderr, "Could not open device.\n");
		goto out;
	}

	while (1)
	{
		printf("Please choose a option:\n");

		while (1)
		{
			printf("1)Register a new User\n2)Register a New Finger\n3)Update an Existing User\n4)Delete a existing User\n5)Exit\nSelected Option: ");
			scanf("%d%*c", &r);
			if (r >= 1 && r <= 5)
				break;
			printf("\nDidn't understand please choose one of the following option:\n");
		}

		switch (r)
		{
		case 1:
			create_user();
			break;
		case 2:
			printf("Will be implemented!\n");
			add_fingerprint();
			break;
		case 3:
			printf("Will be implemented!\n");
			update_user();
			break;
		case 4:
			printf("Will be implemented!\n");
			delete_user();
			break;
		case 5:
			child_pid = fork();

			if (child_pid == 0)
			{
				/* This is done by the child process. */
				char *arguments2[] = {"service", "digital", "start", NULL};
				execvp(command, arguments2);
			}
			else
			{
				/* This is run by the parent.  Wait for the child
					to terminate. */
				printf("Starting the daemon of verifying...\n");
				waitpid(child_pid, &r, 0);
				printf("Daemon started sucefully!\n\n");
			}

			printf("Bye!\n");
			goto out_close;
		}
	}

	printf("Record now your finger, press CTRL+C to cancel\n");

out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	sqlite3_close(db);
	return r;
}
