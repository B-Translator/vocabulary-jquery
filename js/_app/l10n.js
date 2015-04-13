

var _l10n = {
    // Translate some strings.
    translate: function () {
	// Seetings.
        $('#lang').html(_('Language'));
        $('#vocab').html(_('Vocabulary'));
        $('label[for="custom-keyboard"').html(_('Use Custom Keyboard:'));

	// Search.
	$('#search-term').attr('placeholder', _('Search for a word...'));
    }
}
