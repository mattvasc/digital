1. Install the custom build of the libfprint, the instructions are inside libfprint\install-before.txt

2. Compile verify.c and management.c with the commands:
 - gcc management.c -o management -lsqlite3 -lfprint
 - gcc verify.c -o verify -lsqlite3 -lfprint

 3. Create the database: sqlite dababase.db < database.sql

 4. Have fun!