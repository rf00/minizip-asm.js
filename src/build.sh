echo "Beginning Build:"
cd ..

echo "Copy external library..."
cp -r external/zlib .
rm -r zlib/contrib/minizip
cp -r external/minizip zlib/contrib
cp src/main.cpp zlib/contrib/minizip
cp src/main_pre.js zlib/contrib/minizip
cp src/main_post.js zlib/contrib/minizip

echo "Clear output folder..."
rm -r lib
mkdir lib

echo "Make zlib..."
cd zlib
emconfigure ./configure
emmake make

echo "Make aes..."
cd contrib/minizip/aes
emcc aescrypt.c -o aescrypt.o -O -DHAVE_AES
emcc aeskey.c -o aeskey.o -O -DHAVE_AES
emcc aestab.c -o aestab.o -O -DHAVE_AES
emcc entropy.c -o entropy.o -O -DHAVE_AES
emcc fileenc.c -o fileenc.o -O -DHAVE_AES
emcc hmac.c -o hmac.o -O -DHAVE_AES
emcc prng.c -o prng.o -O -DHAVE_AES
emcc pwd2key.c -o pwd2key.o -O -DHAVE_AES
emcc sha1.c -o sha1.o -O -DHAVE_AES
emcc aescrypt.o aeskey.o aestab.o entropy.o fileenc.o hmac.o prng.o pwd2key.o sha1.o -o ../libaes.o

echo "Make minizip..."
cd ..
emcc zip.c -o zip.o -O -I../.. -DHAVE_AES
emcc unzip.c -o unzip.o -O -I../.. -DHAVE_AES
emcc ioapi_mem.c -o ioapi_mem.o -O -I../.. -DHAVE_AES
emcc ioapi.c -o ioapi.o -O -I../.. -DHAVE_AES
emcc -O -I../.. -DHAVE_AES -o ../../../lib/minizip.js main.cpp --memory-init-file 0 -s ALLOW_MEMORY_GROWTH=1 -s NO_FILESYSTEM=1 -s EXPORTED_FUNCTIONS="['_list', '_extract', '_append']" --pre-js main_pre.js --post-js main_post.js zip.o unzip.o ioapi.o ioapi_mem.o ../../libz.a libaes.o -Oz

echo "Finished Build!\nPlease type command 'npm run finalbuild' to complete build."
cd ../../..
rm -r zlib