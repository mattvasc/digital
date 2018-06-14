all:
	gcc management.c -o cadastrar -lfprint -lsqlite3 -Wall -g
	gcc verify.c -o digital -lfprint -lsqlite3 -Wall -g
