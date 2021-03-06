// Versão 1
// Compile with the flags: -lfprint -l sqlite3
// gcc verify.c -o verify -lsqlite3 -lfprint

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <pwd.h>
#include <string.h>
#include <dirent.h>
#include <libfprint/fprint.h>
#include <sqlite3.h>
#include <ctype.h>
#include <sys/wait.h>

/********************************** GLOBAL DECLARATIONS ******************************************************************/
struct fp_print_data **dataGallery; // Vetor de ponteiros do binario da digital!

// Vetor da informacao de cada arquivo
struct fingerprint
{
	int user_id;
	int finger_id;
};
struct fingerprint *fingerprints_db;
int qtd = 0; // quantidade de digitais carregadas!

/***********************************************************************************************************************/

/**
 * Função de callback parao select usado na fn log_user_entrance
 */
static int callback_select_fingerprint(void *data, int argc, char **argv, char **azColName)
{
	int *id;
	if (argc == 1)
	{
		id = data;
		*id = strtol(argv[0], NULL, 0);
		return 0;
	}
	else
	{
		return 1;
	}
}

/**
 * Retorna:
 * 0 em caso de erro
 * 1 em caso de sucesso
 */
int log_user_entrance(struct fingerprint person)
{

	sqlite3 *db;
	char *zErrMsg;
	char *sql;
	sqlite3_stmt *res;

	sql = (char *)calloc(512, 1);
	char *dblocale = (char *)malloc(256);

	strcpy(dblocale, "/digital/database.db");
	int rc;

	int fingerprint_id = 0;

	rc = sqlite3_open(dblocale, &db);
	free(dblocale);
	if (rc)
	{
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		return 0;
	}
	else
		printf("Opened database successfully\n ");

	sprintf(sql, "SELECT id FROM fingerprint WHERE user_id = %d AND finger = %d; ", person.user_id, person.finger_id);
	rc = sqlite3_exec(db, sql, callback_select_fingerprint, &fingerprint_id, &zErrMsg);
	if (rc != SQLITE_OK)
	{
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);
		sqlite3_close(db);
		free(sql);
		return 0;
	}

	if (fingerprint_id <= 0)
		return 0;

	printf("\n\nACHEI FINGERPRINT_ID: %d", fingerprint_id);

	sprintf(sql, "INSERT INTO log (fingerprint_id) VALUES (%d);", fingerprint_id);

	rc = sqlite3_exec(db, sql, NULL, NULL, &zErrMsg);
	if (rc != SQLITE_OK)
	{
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sqlite3_free(zErrMsg);

		rc = 0;
	}
	else
	{
		rc = 1;
	}

	free(sql);
	sqlite3_close(db);

	return rc;
}

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

	set_nr_enroll_stages(dev);

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
		printf("ERRE VALE %d\n\n", r);

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

int load_fingerprints(struct fp_dev *dev)
{
	// struct passwd *pw = getpwuid(getuid());
	// const char *homedir = pw->pw_dir;
	char target[32];
	// strcpy(target,homedir);
	strcpy(target, "/fingerprints/");
	int i = 0;

	struct dirent *de; // Pointer for directory entry

	// opendir() returns a pointer of DIR type.
	DIR *dr = opendir(target);

	// Reseta quantidade de digital
	qtd = 0;

	if (dr == NULL) // opendir returns NULL if couldn't open directory
	{
		printf("Could not open current directory");
		return 1;
	}

	// Refer http://pubs.opengroup.org/onlinepubs/7990989775/xsh/readdir.html
	// for readdir()

	// Counting how many files are in the folder
	while ((de = readdir(dr)) != NULL)
		i++;

	// subtracting the '.' and '..' "files"
	i -= 2;

	// Allocking the fingerprints db
	dataGallery = (struct fp_print_data **)malloc(i * sizeof(struct fp_print_data *));
	fingerprints_db = (struct fingerprint *)malloc(i * sizeof(struct fingerprint));

	// reading the fingerprints db
	dr = opendir(target);
	int t_user_id, t_finger_id;
	while ((de = readdir(dr)) != NULL)
		if (de->d_name[0] != '.' && sscanf(de->d_name, "%d_%d", &t_user_id, &t_finger_id) > 0)
		{
			fp_print_data_load(dev, t_user_id, t_finger_id, &dataGallery[qtd]);
			fingerprints_db[qtd].user_id = t_user_id;
			fingerprints_db[qtd].finger_id = t_finger_id;
			qtd++;
		}

	closedir(dr);

	printf("\nSuccefully loaded %d fingerprints to memory!!\n", qtd);

	return 0;
}

int main(void)
{
	int r = 1, i = 0;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	struct fp_dev *dev;
	struct fp_print_data *data;

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

	fp_set_debug(2);

	discovered_devs = fp_discover_devs();

	if (!discovered_devs)
	{
		fprintf(stderr, "Could not discover devices\n");
		goto out;
	}

	ddev = discover_device(discovered_devs);

	if (!ddev)
	{
		fprintf(stderr, "No devices detected.\n");
		goto out;
	}

	dev = fp_dev_open(ddev);
	fp_dscv_devs_free(discovered_devs);

	if (!dev)
	{
		fprintf(stderr, "Could not open device.\n");
		goto out;
	}

	printf("Opened device. Loading previously enrolled right index fingers "
		   "data...\n");

	// Carrega digitais!
	r = load_fingerprints(dev);

	if (r != 0)
	{
		fprintf(stderr, "Failed to load fingerprint, error %d\n", r);
		goto out_close;
	}

	// Inicia leitura
	do
	{
		// Faz uma leitura de digital e salva em *data!
		data = enroll(dev);

		if (!data)
		{
			printf("Error reading the finger!\n");
			goto out_close;
		}

		// Verifica as digitais carregadas em mem. com a lida!
		i = 0;

		while (i < qtd)
		{
			printf("Going to verify the %dº finger of %d\nUser_id: %d finger_id: %d\n", (i + 1), qtd, fingerprints_db[i].user_id, fingerprints_db[i].finger_id);
			r = verify_process(dataGallery[i], data);
			printf("Going to analyse the result.");
			// TODO: Parametrizar o treshold abaixo, em algum arquivo.
			if (r >= 50)
			{
				if (log_user_entrance(fingerprints_db[i]))
				{
					printf("\n\nAbrindo fechadura!\n\n");
				}
				else
				{
					printf("Digital encontrada, porém usuário não cadastrado! Arquivo: %d_%d.pem", fingerprints_db[i].user_id, fingerprints_db[i].finger_id);
				}
				break;
			}

			i++;
		}

		if (i == qtd)
		{
			printf("\n\nAccess Denied!\n\n");
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
