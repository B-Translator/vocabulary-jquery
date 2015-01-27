# vocabulary-jquery

Vocabulary responsive web app, built with jQuery Mobile.

The data are received through B-Translator API:
 - http://info.btranslator.org/api-examples-js/
 - http://info.btranslator.org/api/


## Building HTML files

HTML files are split into several pieces and templates for easy development
and maintenance. To assemble them use: `tags -r html/ -o .` .
The command `tags` can be installed with: `sudo easy_install brace-tags`.
For more details see: http://tags.brace.io 