/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
var mxLog =
{
	editorContainer: null,

	editor:null,

	/**
	 * Class: mxLog
	 * 
	 * A singleton class that implements a simple console.
	 * 
	 * Variable: consoleName
	 * 
	 * Specifies the name of the console window. Default is 'Console'.
	 */
	consoleName: 'Console',
	
	/**
	 * Variable: TRACE
	 * 
	 * Specified if the output for <enter> and <leave> should be visible in the
	 * console. Default is false.
	 */
	TRACE: false,

	/**
	 * Variable: DEBUG
	 * 
	 * Specifies if the output for <debug> should be visible in the console.
	 * Default is true.
	 */
	DEBUG: true,

	/**
	 * Variable: WARN
	 * 
	 * Specifies if the output for <warn> should be visible in the console.
	 * Default is true.
	 */
	WARN: true,

	/**
	 * Variable: buffer
	 * 
	 * Buffer for pre-initialized content.
	 */
	buffer: '',
	
	/**
	 * Function: init
	 *
	 * Initializes the DOM node for the console. This requires document.body to
	 * point to a non-null value. This is called from within <setVisible> if the
	 * log has not yet been initialized.
	 */
	init: function()
	{
		if (mxLog.window == null && document.body != null)
		{
			var title = mxLog.consoleName;// + ' - mxGraph ' + mxClient.VERSION;

			// Creates a table that maintains the layout
			var table = document.createElement('table');
			table.setAttribute('width', '100%');
			table.setAttribute('height', '100%');

			var tbody = document.createElement('tbody');
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.style.verticalAlign = 'top';
				
			// Adds the actual console as a editorContainer
			mxLog.editorContainer = document.createElement('div');
			mxLog.editorContainer.setAttribute('id', 'mxlog-editor');
			mxLog.editorContainer.style.height = '100%';
			mxLog.editorContainer.style.resize = 'none';

			// Workaround for wrong width in standards mode
			if (mxClient.IS_NS && document.compatMode != 'BackCompat')
			{
				mxLog.editorContainer.style.width = '99%';
			}
			else
			{
				mxLog.editorContainer.style.width = '100%';
			}
			
			td.appendChild(mxLog.editorContainer);
			tr.appendChild(td);
			tbody.appendChild(tr);

			// Creates the container div
			tr = document.createElement('tr');
			mxLog.td = document.createElement('td');
			mxLog.td.style.verticalAlign = 'top';
			mxLog.td.setAttribute('height', '30px');
			
			tr.appendChild(mxLog.td);
			tbody.appendChild(tr);
			table.appendChild(tbody);

			// Adds various debugging buttons

			mxLog.addButton('Copy', function (evt)
			{
				try
				{
					mxUtils.copy(mxLog.editor.getValue());
				}
				catch (err)
				{
					mxUtils.alert(err);
				}
			});			

			mxLog.addButton('Show', function (evt)
			{
				try
				{
					mxUtils.popup(mxLog.editor.getValue());
				}
				catch (err)
				{
					mxUtils.alert(err);
				}
			});	
			
			mxLog.addButton('Clear', function (evt)
			{
				mxLog.editor.setValue('');
			});

			// Cross-browser code to get window size
			var h = 0;
			var w = 0;
			
			if (typeof(window.innerWidth) === 'number')
			{
				h = window.innerHeight;
				w = window.innerWidth;
			}
			else
			{
				h = (document.documentElement.clientHeight || document.body.clientHeight);
				w = document.body.clientWidth;
			}

			mxLog.window = new mxWindow(title, table, Math.max(0, w - 520), Math.max(0, h - 300), 500, 260);
			mxLog.window.setMaximizable(true);
			mxLog.window.setScrollable(false);
			mxLog.window.setResizable(true);
			mxLog.window.setClosable(true);
			mxLog.window.destroyOnClose = false;
			
			// Workaround for ignored textarea height in various setups
			if (((mxClient.IS_NS || mxClient.IS_IE) && !mxClient.IS_GC &&
				!mxClient.IS_SF && document.compatMode != 'BackCompat') ||
				document.documentMode == 11)
			{
				var elt = mxLog.window.getElement();
				
				var resizeHandler = function(sender, evt)
				{
					mxLog.textarea.style.height = Math.max(0, elt.offsetHeight - 70) + 'px';
				}; 
				
				mxLog.window.addListener(mxEvent.RESIZE_END, resizeHandler);
				mxLog.window.addListener(mxEvent.MAXIMIZE, resizeHandler);
				mxLog.window.addListener(mxEvent.NORMALIZE, resizeHandler);

				mxLog.textarea.style.height = '92px';
			}
		}
	},
	
	/**
	 * Function: info
	 * 
	 * Writes the current navigator information to the console.
	 */
	info: function()
	{
		mxLog.writeln(mxUtils.toString(navigator));
	},
			
	/**
	 * Function: addButton
	 * 
	 * Adds a button to the console using the given label and function.
	 */
	addButton: function(lab, funct)
	{
		var button = document.createElement('button');
		button.setAttribute('class', 'btn btn-xs btn-default');
		button.style.margin = "2px 3px";
		mxUtils.write(button, lab);
		mxEvent.addListener(button, 'click', funct);
		mxLog.td.appendChild(button);
	},
				
	/**
	 * Function: isVisible
	 * 
	 * Returns true if the console is visible.
	 */
	isVisible: function()
	{
		if (mxLog.window != null)
		{
			return mxLog.window.isVisible();
		}
		
		return false;
	},
	

	/**
	 * Function: show
	 * 
	 * Shows the console.
	 */
	show: function()
	{
		mxLog.setVisible(true);
		mxLog.editor = ace.edit("mxlog-editor");
		mxLog.editor.setOptions({
		
		});
		
		mxLog.editor.$blockScrolling = Infinity
		mxLog.editor.setTheme("ace/theme/terminal");
		mxLog.editor.getSession().setMode("ace/mode/json");
		mxLog.editor.getSession().setUseWorker(false);
		mxLog.editor.setAutoScrollEditorIntoView(true);
	},

	/**
	 * Function: setVisible
	 * 
	 * Shows or hides the console.
	 */
	setVisible: function(visible)
	{
		if (mxLog.window == null)
		{
			mxLog.init();
		}

		if (mxLog.window != null)
		{
			mxLog.window.setVisible(visible);
		}
	},

	/**
	 * Function: enter
	 * 
	 * Writes the specified string to the console
	 * if <TRACE> is true and returns the current 
	 * time in milliseconds.
	 *
	 * Example:
	 * 
	 * (code)
	 * mxLog.show();
	 * var t0 = mxLog.enter('Hello');
	 * // Do something
	 * mxLog.leave('World!', t0);
	 * (end)
	 */
	enter: function(string)
	{
		if (mxLog.TRACE)
		{
			mxLog.writeln('Entering '+string);
			
			return new Date().getTime();
		}
	},

	/**
	 * Function: leave
	 * 
	 * Writes the specified string to the console
	 * if <TRACE> is true and computes the difference
	 * between the current time and t0 in milliseconds.
	 * See <enter> for an example.
	 */
	leave: function(string, t0)
	{
		if (mxLog.TRACE)
		{
			var dt = (t0 != 0) ? ' ('+(new Date().getTime() - t0)+' ms)' : '';
			mxLog.writeln('Leaving '+string+dt);
		}
	},
	
	/**
	 * Function: debug
	 * 
	 * Adds all arguments to the console if <DEBUG> is enabled.
	 *
	 * Example:
	 * 
	 * (code)
	 * mxLog.show();
	 * mxLog.debug('Hello, World!');
	 * (end)
	 */
	debug: function()
	{
		if (mxLog.DEBUG)
		{
			mxLog.writeln.apply(this, arguments);
		}
	},
	
	/**
	 * Function: warn
	 * 
	 * Adds all arguments to the console if <WARN> is enabled.
	 *
	 * Example:
	 * 
	 * (code)
	 * mxLog.show();
	 * mxLog.warn('Hello, World!');
	 * (end)
	 */
	warn: function()
	{
		if (mxLog.WARN)
		{
			mxLog.writeln.apply(this, arguments);
		}
	},

	/**
	 * Function: write
	 * 
	 * Adds the specified strings to the console.
	 */
	write: function()
	{
		var string = '';
		
		for (var i = 0; i < arguments.length; i++)
		{
			string += arguments[i];
			
			if (i < arguments.length - 1)
			{
				string += ' ';
			}
		}
		
		if (mxLog.editor)
		{
			var session = mxLog.editor.session;
			session.insert({
			   row: session.getLength(),
			   column: 0
			}, "\n" + string)
			
		}
		else
		{
			mxLog.buffer += string;
		}
	},
	
	/**
	 * Function: writeln
	 * 
	 * Adds the specified strings to the console, appending a linefeed at the
	 * end of each string.
	 */
	writeln: function()
	{
		var string = '';
		
		for (var i = 0; i < arguments.length; i++)
		{
			string += arguments[i];
			
			if (i < arguments.length - 1)
			{
				string += ' ';
			}
		}

		if(mxLog.editor){
			var session = mxLog.editor.session;
			session.insert({
			   row: session.getLength(),
			   column: 0
			}, "\n" + string)
		}
	}
	
};
