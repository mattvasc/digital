#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <pwd.h>
#include <string.h>
#include <sqlite3.h> 



static int get_count(void *data, int argc, char **argv, char **azColName){
    int *result = (int) data;
    *result = (argv[0]) ? atoi(argv[0]) : 0 ; 
   return (argv[0]) ? 0 : -1  ;
}

int main()
{
    int rc;
	sqlite3 *db;
    struct passwd *pw = getpwuid(getuid());
    const char *homedir = pw->pw_dir;
    char *zErrMsg;
    char *sql;
     const char* data = "Callback function called";
    //int *count = (int*) malloc(sizeof(int));
    int count = 0;
    char *dblocale = (char*) malloc(256);
    strcpy(dblocale, homedir);
    strcat(dblocale, "/.fprint/database.db");

    rc = sqlite3_open(dblocale, &db);
    free(dblocale);
	if( rc )
	{
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		return(0);
	} 
	else 
		fprintf(stderr, "Opened database successfully\n");
    
    sql = "SELECT COUNT(*) FROM user;";


    rc = sqlite3_exec(db, sql, get_count, (void*) &count, &zErrMsg);

   if( rc != SQLITE_OK ) {
      fprintf(stderr, "SQL error: %s\n", zErrMsg);
      sqlite3_free(zErrMsg);
   } else {
      fprintf(stdout, "Operation done successfully\n");
   }
        printf("You got %d rows\n", count);
	sqlite3_close(db);
    return 0;
}
