
var $app = (function () {

    $(document).ready(function () {
        $( "body>[data-role='panel']" ).panel();
    });

    {% include _app/page_vocabulary.js %}
    {% include _app/disqus.js %}
    {% include _app/term.js %}
    {% include _app/suggestions.js %}
    {% include _app/translations.js %}
    {% include _app/translation.js %}
    {% include _app/messages.js %}
    {% include _app/http_request.js %}

})();
