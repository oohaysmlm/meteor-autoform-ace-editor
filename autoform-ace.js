AutoForm.addInputType('ace', {
	template: 'afAce',
	valueIn: function(val, atts) {
        if (atts.id) 
        {
          var editor = AceEditor.instance(atts.id);
          if (editor && (typeof editor === "object")) {
	          editor.setValue(val);
          }
        }

        return val;
	},
	valueOut: function() {
		var editor = AceEditor.instance(this.attr('id'));
		return editor.getValue();
	}
});

Template.afAce.onRendered(function() {
	var template = this;
	var theme = template.data.atts['data-ace-theme'] || 'xcode';
	var mode = template.data.atts['data-ace-mode'] || 'javascript';
	var height = template.data.atts['data-ace-height'] || '300px';
	var static_words = template.data.atts['data-ace-static-words'] || null;
	
	var staticWordsCompletor = null;
	
	if (static_words)
	{
		var words = static_words;

		if (typeof(static_words) === 'function')
		{
			words = static_words();
		}

		staticWordsCompletor = {
		    getCompletions: function(editor, session, pos, prefix, callback) {
			var wordList = words;
			callback(null, wordList.map(function(word) {
			    return {
				caption: word,
				value: word,
				meta: "static"
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

	Tracker.autorun(function(e) {
		template.editor = AceEditor.instance(template.editorId, {
			theme: theme,
			mode:  mode
		});
		
		if (staticWordsCompletor)
		{
			template.editor.completors = [staticWordsCompletor];
		}

		if (!_.isUndefined(template.editor.loaded) && template.editor.loaded) {
			e.stop();
			template.editor.$blockScrolling = Infinity;

			if (initialValue) {
				template.editor.insert(initialValue);
			}
		}
	});
});
