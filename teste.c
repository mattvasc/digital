#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <libfprint/fprint.h>

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

int main(void)
{
    int r = 1;
	struct fp_dscv_dev *ddev;
	struct fp_dscv_dev **discovered_devs;
	struct fp_dev *dev;
	struct fp_print_data *data = NULL;
    struct fp_img *img = NULL;
    char nome_arquivo[64];
    int c;

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
    printf("Opened device!\n");

    r = fp_print_data_load(dev, RIGHT_INDEX, &data);
	if (r != 0) {
		fprintf(stderr, "Failed to load fingerprint, error %d\n", r);
		fprintf(stderr, "Did you remember to enroll your right index finger "
			"first?\n");
		goto out_close;
	}
    
    printf("\nScan your finger now.\n");
    for(c = 0; c< 5 ; c++)
    {
        sleep(1);
        r = fp_verify_finger_img(dev, data, &img);
        if (img) 
        {
            printf("Digite o nome do arquivo para salvar: ");
            fgets(nome_arquivo, 63, stdin);
            nome_arquivo[strlen(nome_arquivo) - 1 ] = '\0';
            strcat(nome_arquivo, ".pgm");
            fp_img_save_to_file(img, nome_arquivo);
            printf("Wrote scanned image to verify.pgm\n");
            fp_img_free(img);
       }
    }
    

    
out_close:
	fp_dev_close(dev);
  
out:
	fp_exit();
	return r;

}