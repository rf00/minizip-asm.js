CC=emcc
CFLAGS=-O -I../..

UNZ_OBJS = miniunz.o unzip.o ioapi.o ../../libz.a
ZIP_OBJS = minizip.o zip.o   ioapi.o ../../libz.a

UNZ_DIST = ../../../lib/miniunz.js
ZIP_DIST = ../../../lib/minizip.js

EMCC_FLAGS = --memory-init-file 0 -Oz

UNZ_FLAGS = --pre-js ../../../src/unzip_pre.js --post-js ../../../src/unzip_post.js
ZIP_FLAGS = --pre-js ../../../src/zip_pre.js --post-js ../../../src/zip_post.js

.c.o:
	$(CC) -c $(CFLAGS) $*.c

all: miniunz minizip

miniunz:  $(UNZ_OBJS)
	$(CC) $(CFLAGS) -o $(UNZ_DIST) $(EMCC_FLAGS) $(UNZ_FLAGS) $(UNZ_OBJS)

minizip:  $(ZIP_OBJS)
	$(CC) $(CFLAGS) -o $(ZIP_DIST) $(EMCC_FLAGS) $(ZIP_OBJS) $(ZIP_FLAGS)

test:	miniunz minizip
	./minizip test readme.txt
	./miniunz -l test.zip
	mv readme.txt readme.old
	./miniunz test.zip

clean:
	/bin/rm -f *.o *~ minizip miniunz
