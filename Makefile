verify:
	gcc verify.c -o verify -lsqlite3 -lfprint -g

management:
	gcc management.c -o management -lsqlite3 -lfprint -g

clean:
	rm -f management
	rm -f verify

database:
	sqlite3 database.db < database.sql

all::
	$(MAKE) clean
	$(MAKE) management
	$(MAKE) verify