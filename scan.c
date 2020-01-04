
// Compile with the flags: -lfprint 
// gcc management.c -o management -lfprint

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pwd.h>
#include <sys/types.h>
#include <libfprint/fprint.h>
#include <string.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/wait.h>

struct fp_dev *dev;
struct fp_print_data *data;

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

// ********************************************************************************************




int main(int argc, char* argv[])
{

	int r = 0;
	int target_user_id = 0, target_finger_id = 11;

	if(argc < 3){
		fprintf(stderr, "Error! Wrong call.\nusage: scan {user_id} {finger_id}\n");
		exit(1);
	}

	target_user_id = strtol(argv[1], NULL, 0);
	target_finger_id = strtol(argv[2], NULL, 0);

	if(target_finger_id > 9 || target_user_id == 0 || target_finger_id < 0)
	{
		fprintf(stderr, "Error! Wrong call.\nusage: scan {user_id} {finger_id}\n");
		exit(1);
	}
	

	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;

	if (!getenv("SUDO_UID"))
	{
		printf("\nError! The program must run with sudo privileges!\n\n");
		return -1;
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

	data = enroll(dev);
	if (!data)
	{
		printf("There was an error while enrolling the user fingerprint!!");
		goto out_close;
		r = -1;
	}

	char target_file[32];

	sprintf(target_file, "/fingerprints/%d_%d.pgm", target_user_id, target_finger_id);

	r = fp_print_data_save_dir(data, "/fingerprints", target_file);

	if (r != 0)
		fprintf(stderr, "Data save failed, code %d\n", r);

	fp_print_data_free(data);

	goto out_close;

out_close:
	fp_dev_close(dev);
out:
	fp_exit();
	return r;
}
