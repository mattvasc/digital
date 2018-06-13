#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <pwd.h>
#include <string.h>

#include <dirent.h>


/*

    PROGRAMA QUE LISTA TODOS AS DIGITAIS
    CAPTURADAS COMO INT.

    ALTERAÇÕES NA LINHA 44 SÃO INTERESSANTES
*/

int main()
{
 
    struct passwd *pw = getpwuid(getuid());
    const char *homedir = pw->pw_dir;
    char target[512];
    strcpy(target,homedir);
    strcat(target, "/.fprint/prints/0002/00000000");

    struct dirent *de;  // Pointer for directory entry
 
    // opendir() returns a pointer of DIR type. 
    DIR *dr = opendir(target);
   // free(target);
 
    if (dr == NULL)  // opendir returns NULL if couldn't open directory
    {
        printf("Could not open current directory" );
        return 0;
    }
 
    // Refer http://pubs.opengroup.org/onlinepubs/7990989775/xsh/readdir.html
    // for readdir()
    while ((de = readdir(dr)) != NULL)
        if(de->d_name[0] != '.' && strlen(de->d_name) == 3)
            printf("%d\n", (int) strtol(de->d_name, NULL, 16)); 
 
    closedir(dr);    
   
    return 0;
}
