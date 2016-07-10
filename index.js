'use strict';

var fs = require('fs'),
	glob = require('glob');

class WalkTheLine {
	constructor(opts) {
		this.options = opts || {};
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
		this.file = this.files[this.fileIndex];
		this.lines = fs.readFileSync(this.file, 'utf8').split('\n');
		this.lineIndex = this.options.headerline ? 1 : 0;
		this.headerline = this.options.headerline ? this.lines[0] : null;

		this.callConditionalFunction('fileStart', [this.file, this.lines.length])
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
		let line = this.lines[this.lineIndex];
		this.callConditionalFunction('line', [this.lineIndex, this.lines.length, line]);
	}
	/**
	 * Called when the line method is done
	 */
	lineDone() {
		this.lineIndex++;

		if(this.lineIndex >= this.lines.length) {
			this.callConditionalFunction('fileEnd', [this.file]);
		} else setTimeout(this.nextLine.bind(this), 0);
	}
	/**
	 * Called when the fileEnd method is done
	 */
	fileEndDone() {
		this.fileIndex++;

		if(this.fileIndex >= this.files.length) {
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
		if (!this.options.source) throw new Error('No source set');

		// Get stats for source and throw can't
		try {
			var stats = fs.lstatSync(this.options.source);
		}
		catch(e) {
			throw new Error('Unable to access source');
		}
		if(stats.isFile()) {
			this.files = [this.options.source];
		} else if (stats.isDirectory()) {
			if( this.options.source.split(-1) !== '/' ) this.options.source += '/';
			let pattern = this.options.extension ? `${this.options.source}*.${this.options.extension}` : `${this.options.source}*`;
			this.files = glob.sync(pattern, {
				'nodir': true
			});
		}

		// Initialise variables
		this.fileIndex = 0;
	}

	/**
	 * Calls the function of the provided name if it exists on this object.
	 * Conditionally adds a done callback based on the number of arguments
	 * of the defined function. Calls a function named `name + 'Done'` after
	 * this name function is called or not called.
	 */
	callConditionalFunction(name, args) {
		let done = name + 'Done';
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
	}

	/**
	 * Initiates the process
	 */
	run() {
		this.prepare();

		this.callConditionalFunction('start', [this.files.length]);
	}
}

module.exports = WalkTheLine;