
/**
 * Return the value of the given search parameter, or null.
 */
var get_param = function (param_name) {
    var results = new RegExp('[\?&]' + param_name + '=([^&#]*)').exec(window.location.href);
    return results && results[1];
};

// Set language/vocabulary, if given as parameters.
var lng = get_param('lng');
lng && localStorage.setItem('vocabulary.lng', lng);
var proj = get_param('proj');
proj && localStorage.setItem('vocabulary.vocabulary', proj);
