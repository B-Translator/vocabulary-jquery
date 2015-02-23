
var _suggestions = {
    /**
     * This function is called when the user starts to type a term on the
     * search-term input. It retrieves from the server a list of
     * autocomplete suggestions and displays them under the search box.
     */
    list: function (event, data) {
        // Get the search term typed so far.
        var search_term = $(data.input).val();
        if (!search_term) { return; }
        if (search_term.length < 2) { return; }

        // Retrieve a suggestions list from the server and display them.
        var url = '/translations/autocomplete/string/vocabulary'
	    + '/' + $config.vocabulary + '/' + search_term;
        http_request(url).then(_suggestions.display);
    },

    /**
     * Build and display a list of the terms suggested from the server.
     * When a term is clicked it should be selected.
     */
    display: function(term_list) {
        // Get the numbers of terms
        var count = Object.keys(term_list).length;

        // If the list is empty, add the current term as a new term.
        if (count == 0) {
            _suggestions.hide();
            _translations.hide();
            $('#add-new-term').show();
            return;
        }

        // If there is only one term in the list
        // just display it, don't build the suggestion list.
        if (count == 1) {
            for (var term in term_list) {
                _term.display(term);
                return;
            };
        }

        // Hide translations and the add button.
        _translations.hide();
        $('#add-new-term').hide();

        // Get the data for the list of suggestions.
        var data = { terms: [] };
        $.each(term_list, function (id, term) {
            data.terms.push(term);
        });

        // Render and display the template of suggestions.
        var tmpl = $('#tmpl-suggestions').html();
        $('#suggestions').html(Mustache.render(tmpl, data))
            .listview('refresh').trigger('updatelayout');

        // When a term from the list is clicked, select that term.
        $('.term').on('click', function () {
            // Display the selected term.
            var term = $(this).html();
            _term.display(term);
        });
    },

    /** Hide the list of suggestions. */
    hide: function () {
        $('#suggestions')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');
    },
};
