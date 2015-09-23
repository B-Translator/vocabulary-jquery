#!/bin/bash

cd $(dirname $0)

find ../js/ -name '*.js' | xargs \
xgettext --keyword=_t -o app.pot -L JavaScript --from-code=utf-8

cp app.pot po/en.po

#languages="sq de fr"
languages="sq de"
for lng in $languages
do
    msgmerge -U po/$lng.po app.pot
done

echo "
Update the translation files in the directory 'po/'
and then convert them to JS like this: 
    ./po2js.py po/sq.po
"
