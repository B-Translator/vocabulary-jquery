#!/bin/bash
### Generate HTML and JS files of the aplication by including partial files.
###
### Brace Tags can be installed with: `sudo easy_install brace-tags`
### or with: `pip install -e path/to/your/brace-tags/folder`
### For more details see: https://github.com/braceio/tags

### Generate HTML files. 
tags build --root html/ --output .

### Generate JavaScript files.
tags build --root js/_js/ --output js/ \
           --files '**/*.js' --force
