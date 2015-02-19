
var _disqus = {
    //  Initialize Disqus.
    init: function (shortname) {
        if (typeof(DISQUS) == 'undefined'){
            (function() {
                var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                dsq.src = 'http://' + shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
        }
    },

    // Reload disqus data.
    reload: function (sguid, term) {
        if ($('.disqus-wrap').length == 1) {
            $('.disqus-inactive').addClass('disqus-active').removeClass('disqus-inactive').attr('id','disqus_thread');
        }
        if (typeof(DISQUS) !== 'undefined'){
            DISQUS.reset({
                reload: true,
                config: function () {
                    this.page.identifier = 'translations/sq/' + sguid;
                    this.page.url = 'http://fjalori.fs.al/#' + term;
                    this.page.title = term;
                }
            });
        }
    },
}
