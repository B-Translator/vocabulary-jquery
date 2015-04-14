#!/bin/bash

cd $(dirname $0)

find ../js/ -name '*.js' | xargs \
xgettext -o app.pot -L JavaScript --from-code=utf-8

#languages="sq de fr"
languages="sq"
for lng in $languages
do
    msgmerge -U po/$lng.po app.pot
done

echo "
Update the translation files in the directory 'po/'
and then convert them to JS like this: 
    ./po2js.py po/sq.po
"
