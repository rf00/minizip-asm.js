echo "Beginning Build:"

cd ..

cd zlib
chmod +x ./configure
cd ..

rm -r lib
mkdir lib

cd zlib
make clean
emconfigure ./configure
emmake make

cd contrib/minizip
make clean
make

cd ../../..

echo "Finished Build\nPlease type command 'npm run finalbuild' to complete build"