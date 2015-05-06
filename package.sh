#!/bin/bash

### go to the script directory
cd $(dirname $0)

### copy all the app files to the directory zip/
rm -rf zip/
mkdir zip
cp -a * zip/

### clean files that are not needed
cd zip
rm -rf html/ js/ zip/
find . -name '*.sh' -o -name '*.py' | xargs rm

### create the zip package
find . -type f | zip ../vocabulary.zip -@
#zip -r ../vocabulary.zip .

### clean up
cd ..
#rm -rf zip/

