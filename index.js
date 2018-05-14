'use strict';

var fs = require('fs'),
	glob = require('glob'),
	path = require('path');

class WalkTheLine {
	constructor(opts) {
		this._options = opts || {};
	}

	/**
	 * Get files
	 */
	get files() {
		return this._files;
	}
	/**
	 * Get Headerline
	 */
	get headerline() {
		return this._headerline;
	}
	/**
	 * Get plugins
	 */
	get plugins() {
		return this._plugins;
	}

	/**
	 * Called when the start method is done.
	 * The start method is called when the process begins.
	 */
	startDone() {
		setTimeout(this.nextFile.bind(this), 0)
	}
	/**
	 * Starts the next file
	 */
	nextFile() {
		this._file = this._files[this._fileIndex];
		this._lines = fs.readFileSync(this._file, 'utf8').split('\n');
		this._lineIndex = this._options.headerline ? 1 : 0;
		this._headerline = this._options.headerline ? this._lines[0] : null;

		this.callConditionalFunction('fileStart', [this._file, this._lines.length])
	}
	/**
	 * Called when the fileStart method is done
	 */
	fileStartDone() {
		setTimeout(this.nextLine.bind(this), 0);
	}
	/**
	 * Starts the next line
	 */
	nextLine() {
		let line = this._lines[this._lineIndex];
		this.callConditionalFunction('line', [this._lineIndex, this._lines.length, line]);
	}
	/**
	 * Called when the line method is done
	 */
	lineDone() {
		this._lineIndex++;

		if(this._lineIndex >= this._lines.length) {
			this.callConditionalFunction('fileEnd', [this._file]);
		} else setTimeout(this.nextLine.bind(this), 0);
	}
	/**
	 * Called when the fileEnd method is done
	 */
	fileEndDone() {
		this._fileIndex++;

		if(this._fileIndex >= this._files.length) {
			this.callConditionalFunction('end');
		} else setTimeout(this.nextFile.bind(this), 0);
	}
	/**
	 * Called when the end method is done
	 */
	endDone() {
		
	}

	/**
	 * Ensures the requisite variables are set and initialises variables
	 */
	prepare() {
		// Throw if source isn't set
		if (!this._options.source) throw new Error('No source set');

		// Get stats for source and throw can't
		try {
			var stats = fs.lstatSync(this._options.source);
		}
		catch(e) {
			throw new Error('Unable to access source');
		}
		if(stats.isFile()) {
			this._files = [this._options.source];
		} else if (stats.isDirectory()) {
			if( this._options.source.split(-1) !== '/' ) this._options.source += '/';
			let pattern = this._options.extension ? `${this._options.source}*.${this._options.extension}` : `${this._options.source}*`;
			this._files = glob.sync(pattern, {
				'nodir': true
			});
		}

		// initialise plugins
		if(this._options.plugins) {
			this._plugins = {};
			for (var key in this._options.plugins) {
				const pName = `./plugins/${key}`;
				const pPath = path.join(__dirname, `${pName}.js`);
				const pOptions = this._options.plugins[key];
				try{
					const stats = fs.lstatSync(pPath);
				}
				catch(e) {
					throw new Error(`Unable to create plugin with name ${key}`);
				}
				const Plugin = require(pName);
				this._plugins[key] = new Plugin(pOptions);
			}
		}

		// Initialise variables
		this._fileIndex = 0;
	}

	/**
	 * Calls the function of the provided name if it exists on this object.
	 * Conditionally adds a done callback based on the number of arguments
	 * of the defined function. Calls a function named `name + 'Done'` after
	 * this name function is called or not called.
	 */
	callConditionalFunction(name, args) {
		let done = name + 'Done';
		// Main instance
		if(typeof this[name] === 'function') {
			if (args) {
				if(this[name].length <= args.length) {
					this[name].apply(this, args);
					this[done]();
				} else {
					args.push(this[done].bind(this));
					this[name].apply(this, args);
				}
			} else {
				this[name]();
				this[done]();
			}
		} else this[done]();
		// Plugins
		for (var p in this._plugins) {
			const plugin = this._plugins[p];
			if(typeof plugin[name] === 'function') {
				plugin[name].apply(plugin, args);
			}
		}
	}

	/**
	 * Initiates the process
	 */
	run() {
		this.prepare();

		this.callConditionalFunction('start', [this._files.length]);
	}
}

module.exports = WalkTheLine;