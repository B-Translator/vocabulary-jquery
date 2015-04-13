#!/bin/bash

cd $(dirname $0)

find ../js/ -name '*.js' | xargs \
xgettext -o app.pot -L JavaScript --from-code=utf-8

