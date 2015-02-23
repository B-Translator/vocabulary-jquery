
var $app = (function () {

    {% include options.js %}
    {% include _app/settings.js %}
    {% include _app/menu.js %}
    {% include _app/page_vocabulary.js %}
    {% include _app/disqus.js %}
    {% include _app/term.js %}
    {% include _app/suggestions.js %}
    {% include _app/translations.js %}
    {% include _app/translation.js %}
    {% include _app/messages.js %}
    {% include _app/http_request.js %}
    
})();
