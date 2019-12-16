// This trick is from here:
// https://stackoverflow.com/questions/53237644/how-to-right-align-some-part-of-text-in-option-in-select
var CJ_Select2_Hashcat = {
    escapeMarkup: function (markup) {
        return markup;
    },

    templateResult: function (item) {
        if (item.id == -1) {
            return '';
        }
        return '<span>' + item.text + '</span><span class="float-right subtext">' + item.id + '</span>';
    },

    templateSelection: function (item) {
        if (item.id == '') {
            return '';
        }
        return item.text + ' ( ' + item.id + ')';
    },

    matcher: function (params, data) {
        if ($.trim(params.term) === '') {
            return data;
        } else if (typeof data.text === 'undefined') {
            return null;
        }

        // What we are searching for - to lowercase to make our life easier.
        searchFor = params.term.toString().toLowerCase().trim();
        searchIn = data.text.toString().toLowerCase();
        searchInId = data.id.toString();

        var found = CJ_Select2_Hashcat.select2Search(searchFor, searchIn, searchInId);

        if (found) {
            return modifiedData = $.extend({}, data, true);
        }

        return null;
    },

    select2Search: function(searchTerms, searchInText, searchInId) {
        // I could use regular expressions but I refuse to.
        // https://blog.codinghorror.com/regular-expressions-now-you-have-two-problems/

        searchTerms = searchFor.split(' ');
        // See if ALL terms appear in the element. This is helpful when you want to search for
        // "Oper Syst Lin" rather than the whole text.
        var count = 0;
        for (var i = 0; i < searchTerms.length; i++) {
            if (searchInText.indexOf(searchTerms[i]) > -1) {
                count++;
            }
        }
        found = (count == searchTerms.length);

        // This part helps us match against the ID as well.
        for (var i = 0; i < searchTerms.length; i++) {
            if (!CJ_Utils.isInteger(searchTerms[i])) {
                // This isn't a number - we don't care about it.
                continue;
            }

            // Even though this is a number, we want to compare the start of the ID.
            // This would make "13100" visible through all keypresses of "1", "13", "1310"...etc.
            if (searchInId.indexOf(searchTerms[i]) == 0) {
                // We overwrite the "found" variable as we don't care about its previous value.
                found = true;
                break;
            }
        }

        return found;
    }
};

var CJ_Select2_Wordlists = {
    escapeMarkup: function (markup) {
        return markup;
    },

    templateResult: function (item) {
        if (item.id == -1) {
            return '';
        }
        return '<span>' + item.text + '</span><span class="float-right subtext">' + item.size + '</span>';
    },

    templateSelection: function (item) {
        if (item.id == '') {
            return '';
        }
        return item.text + ' (' + item.size + ')';
    },

    matcher: function (params, data) {
        if ($.trim(params.term) === '') {
            return data;
        } else if (typeof data.text === 'undefined') {
            return null;
        }

        // What we are searching for - to lowercase to make our life easier.
        searchFor = params.term.toString().toLowerCase().trim();
        searchIn = data.text.toString().toLowerCase();
        searchInId = data.id.toString();

        var found = CJ_Select2_Wordlists.select2Search(searchFor, searchIn, searchInId);

        if (found) {
            return modifiedData = $.extend({}, data, true);
        }

        return null;
    },

    select2Search: function(searchTerms, searchInText, searchInId) {
        // I could use regular expressions but I refuse to.
        // https://blog.codinghorror.com/regular-expressions-now-you-have-two-problems/

        searchTerms = searchFor.split(' ');
        // See if ALL terms appear in the element. This is helpful when you want to search for
        // "Oper Syst Lin" rather than the whole text.
        var count = 0;
        for (var i = 0; i < searchTerms.length; i++) {
            if (searchInText.indexOf(searchTerms[i]) > -1) {
                count++;
            }
        }
        found = (count == searchTerms.length);

        return found;
    }
};

var CJ_SessionsSetup = {
    init: function(supported_hashes, wordlists, selected_hashtype, selected_wordlist, selected_rule) {
        this.bindHashType(supported_hashes, selected_hashtype);
        this.bindWordlists(wordlists, selected_wordlist);
        this.bindRules(selected_rule);
        this.bindUsedWordlists();
        this.bindModes();
        this.bindForm();
    },

    setModes: function() {
        mode = $("input[name='mode']:checked").val();
        if (mode == 0) {
            $('.box-mode-wordlist').removeClass('d-none');
            $('.box-mode-bruteforce').addClass('d-none');
        } else if (mode == 3) {
            $('.box-mode-bruteforce').removeClass('d-none');
            $('.box-mode-wordlist').addClass('d-none');
        }
    },

    bindModes: function() {
        this.setModes();
        $('.mode-option').click(function() {
            CJ_SessionsSetup.setModes();
            return true;
        });
    },

    bindForm: function() {
        $('#setup-hashcat').validate();
    },

    bindRules: function(selected_rule) {
        $('#rule').select2({}).val(selected_rule).trigger('change');
    },

    bindHashType: function(supported_hashes, selected_hashtype) {
        supported_hashes = this.processSupportedHashes(supported_hashes);
        $('#hash-type').select2({
            placeholder: 'Select hash type',
            data: supported_hashes,
            escapeMarkup: CJ_Select2_Hashcat.escapeMarkup,
            templateResult: CJ_Select2_Hashcat.templateResult,
            templateSelection: CJ_Select2_Hashcat.templateSelection,
            matcher: CJ_Select2_Hashcat.matcher
        }).val(selected_hashtype).trigger('change');
    },

    bindWordlists: function(wordlists, selected_wordlist) {
        wordlists = this.processWordlists(wordlists);
        $('#wordlist').select2({
            placeholder: 'Select wordlist',
            data: wordlists,
            escapeMarkup: CJ_Select2_Wordlists.escapeMarkup,
            templateResult: CJ_Select2_Wordlists.templateResult,
            templateSelection: CJ_Select2_Wordlists.templateSelection,
            matcher: CJ_Select2_Wordlists.matcher
        }).val(selected_wordlist).trigger('change');
    },

    bindUsedWordlists: function() {
        $('.used_wordlists').click(function() {
            if ($('.box-used_wordlists').hasClass('d-none')) {
                $('.used_expand').addClass('d-none');
                $('.used_collapse').removeClass('d-none');
                $('.box-used_wordlists').removeClass('d-none');
            } else {
                $('.used_expand').removeClass('d-none');
                $('.used_collapse').addClass('d-none');
                $('.box-used_wordlists').addClass('d-none');
            }
            return false;
        });
    },

    processSupportedHashes: function(supported_hashes) {
        // Convert keys to properties.
        data = [];
        for (var type in supported_hashes) {
            if (supported_hashes.hasOwnProperty(type)) {
                data.push({
                    id: type,
                    text: supported_hashes[type]
                })
            }
        }

        // And sort.
        return CJ_Utils.sortSelect2Data(data);
    },

    processWordlists: function(wordlists) {
        // Convert keys to properties.
        data = [];
        for (var name in wordlists) {
            if (wordlists.hasOwnProperty(name)) {
                data.push({
                    id: name,
                    text: name,
                    size: wordlists[name].size_human
                });
            }
        }

        return CJ_Utils.sortSelect2Data(data);
    }
};