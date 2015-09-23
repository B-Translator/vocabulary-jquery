#!/bin/bash
### Make a tgz archive that can be imported at 
### https://btranslator.org/btr/project/

cd $(dirname $0)

rm -rf import/
mkdir import/

mkdir import/pot/
cp app.pot import/pot/vocabulary.pot

mkdir import/sq/
cp po/sq.po import/sq/vocabulary.po

mkdir import/de/
cp po/de.po import/de/vocabulary.po

cd import/
tar cfz ../vocabulary.tgz .

cd ..
rm -rf import/
