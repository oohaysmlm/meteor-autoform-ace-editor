AutoForm.addInputType('ace-multilang', {
    template: 'afAceMultilang',
    valueOut: function() {
        var editor = AceEditor.instance(this.attr('id'));
        return {
            code: editor.getValue(),
            language: editor.session.$modeId.substr(9)
    	  };
    }
});

var loadScript = function (script, successfulCB, failCB) {
    var request;
    if (window.XMLHttpRequest){
        request = new XMLHttpRequest();
    } else {
        try {
            request=new ActiveXObject("Microsoft.request");
        } catch(e) {
            console.log("even ActiveXObject('Microsoft.request') doesn't work :(")
            return;
        }
    }
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            try {
                (function( code ) {
                    window.eval.call( window, code );
                })( request.response);
            } catch(e) {
                console.log(script +" is loaded but can't be eval(), man!");
            } finally{
                if ( typeof successfulCB === 'function' ) {
                    successfulCB();
                }
            }
        }else if (request.status == 400){
            console.log("failed to load "+script);
            if ( typeof failCB === 'function' ) {
                failCB();
            }
        }
    }
    request.open("GET", script , true);
    request.send();
}

Template.afAceMultilang.onRendered(function() {
    var template = this;
    var theme = template.data.atts['data-ace-theme'] || 'xcode';
    var mode = template.data.atts['data-ace-mode'] || 'java';
    var height = template.data.atts['data-ace-height'] || '300px';
    var static_words = template.data.atts['data-ace-static-words'] || null;
    var basic_autocompletion = template.data.atts['data-ace-basic-autocompletion'] || false;
    var live_autocompletion = template.data.atts['data-ace-live-autocompletion'] || false;
    var atts = template.data.atts;
    var extraData = JSON.parse(this.data.atts['data-extra']);

    var staticWordsCompletor = null;

    if (static_words)
    {
        var words = static_words;

        staticWordsCompletor = {
            getCompletions: function(editor, session, pos, prefix, callback) {

                var wordList = words;

                if (typeof(words) === 'function')
                {
                    wordList = words();
                }

                callback(null, wordList.map(function(word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "PG"
                    };
                }));

            }
        }
    }


    var initialValue;

    if (template.data && template.data.value && template.data.value.length > 0) {
        initialValue = template.data.value;
    }

    template.editorId = template.$('pre').first().attr('id');
    template.$('#' + template.editorId).css('min-height', height);

      AceEditor.instance(template.editorId, {
        theme: theme,
        mode:  mode
      }, function(editor){
        template.editor = editor;
        //if (!_.isUndefined(template.editor.loaded) && template.editor.loaded) {
          //e.stop();
          template.editor.$blockScrolling = Infinity;

          if (initialValue) {
            template.editor.insert(initialValue);
          }
          else{
            var extraData = JSON.parse(template.data.atts['data-extra']);
            var initLang = extraData.languages[0];
            editor.setValue(extraData.signatures[initLang], -1);
            editor.clearSelection();
          }

          if (staticWordsCompletor)
          {
            var langTools = window.ace.require("ace/ext/language_tools");
            if (langTools)
            {
              langTools.addCompleter(staticWordsCompletor);
              template.editor.setOptions({
                enableBasicAutocompletion: basic_autocompletion,
                enableLiveAutocompletion: live_autocompletion,
              });
            }
            else
            {
              loadScript(window.ace.config.all().basePath+"ext-language_tools.js", function() {
                var langTools = window.ace.require("ace/ext/language_tools");
                if (langTools)
                {
                  langTools.addCompleter(staticWordsCompletor);
                  template.editor.setOptions({
                    enableBasicAutocompletion: basic_autocompletion,
                    enableLiveAutocompletion: live_autocompletion,
                  });
                }
              });
            }
          }
        //}


      });
    /*
    Tracker.autorun(function(e) {
        template.editor = AceEditor.instance(template.editorId, {
            theme: theme,
            mode:  mode
        });
        if (!_.isUndefined(template.editor.loaded) && template.editor.loaded) {
            e.stop();
            template.editor.$blockScrolling = Infinity;

            if (initialValue) {
                template.editor.insert(initialValue);
            }

            if (staticWordsCompletor)
            {
                var langTools = window.ace.require("ace/ext/language_tools");
                if (langTools)
                {
                    langTools.addCompleter(staticWordsCompletor);
                    template.editor.setOptions({
                        enableBasicAutocompletion: basic_autocompletion,
                        enableLiveAutocompletion: live_autocompletion,
                    });
                }
                else
                {
                    loadScript(window.ace.config.all().basePath+"ext-language_tools.js", function() {
                        var langTools = window.ace.require("ace/ext/language_tools");
                        if (langTools)
                        {
                            langTools.addCompleter(staticWordsCompletor);
                            template.editor.setOptions({
                                enableBasicAutocompletion: basic_autocompletion,
                                enableLiveAutocompletion: live_autocompletion,
                            });
                        }
                    });
                }
            }
        }
    });
    */
    template.$('select').change(function (e) {
        template.editor = AceEditor.instance(template.editorId, {
            theme: theme,
            mode:  e.target.value.toLowerCase()
        });
        template.editor.setValue(extraData.signatures[e.target.value.toLowerCase()], -1);
        template.editor.clearSelection();
    });
});

Template.afAceMultilang.helpers({
    lowerCase: function (s) {
        s.toLowerCase();
    },
    languageCanBeChosen: function () {
    	if (this.atts === undefined) {
    		return false;
		}
    	return this.atts.selectLanguage;
	},
    languages: function () {
        if (this.atts === undefined) return ['Java'];
    	return this.atts.languageOptions;
	}
});