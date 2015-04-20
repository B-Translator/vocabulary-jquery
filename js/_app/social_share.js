
var _social_share = {
    /** Update the social share buttons. */
    update: function(term, translations) {
        var title = $('h1').html() + ': ' + term;
        var summary = term + ' <==> ' + translations.join(' / ');
        var mobile_url = $config.app_url 
            + '/?lng=' + $config.lng + '&proj=' + $config.vocabulary
            + '#' + term;
        var url = $config.api_url
            + '/vocabulary/' + $config.vocabulary + '/' + term
            + '/?url=' + encodeURIComponent(mobile_url);

        $('#share-facebook').click(function() {
            window.open('https://www.facebook.com/sharer/sharer.php'
                        + '?u=' + encodeURIComponent(url));
        });

        $('#share-googleplus').click(function() {
            window.open('https://plus.google.com/share'
                        + '?url=' + encodeURIComponent(url)
                        + '&hl=' + $config.lng);
        });

        $('#share-twitter').click(function() {
            window.open("https://twitter.com/intent/tweet"
                        + '?text=' + encodeURIComponent(summary)
                        + '&url=' + encodeURIComponent(mobile_url)
                        + '&hashtags=' + $config.vocabulary);
        });

        $('#share-linkedin').click(function() {
            window.open("https://www.linkedin.com/shareArticle?mini=true"
                        + '&url=' + encodeURIComponent(mobile_url)
                        + '&title=' + encodeURIComponent(title)
                        + '&summary=' + encodeURIComponent(summary)
                        + '&source=' + encodeURIComponent($('h1').html()));
        });
    },
};
