'use strict';

var _ = require('lodash'),
	fs = require('fs'),
	glob = require('glob');

class WalkTheLine {
	constructor(opts) {
		this.options = _.defaults({}, opts, {

		});
	}

	/**
	 * Called when the start method is done.
	 * The start method is called when the process begins.
	 */
	startDone() {
		this.nextFile();
	}
	/**
	 * Starts the next file
	 */
	nextFile() {
		this.file = this.files[this.fileIndex];
		this.lines = fs.readFileSync(this.file, 'utf8').split('\n');
		this.lineIndex = 0;

		this.callConditionalFunction('fileStart', [this.file, this.lines.length])
	}
	/**
	 * Called when the fileStart method is done
	 */
	fileStartDone() {
		this.nextLine();
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
		} else this.nextLine();
	}
	/**
	 * Called when the fileEnd method is done
	 */
	fileEndDone() {
		this.fileIndex++;

		if(this.fileIndex >= this.files.length) {
			this.callConditionalFunction('end');
		} else this.nextFile();
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

		// return;
		// this.lines = fs.readFileSync(this.filename, 'utf8').split('\n');
		// this.count = this.lines.length;
		// this.index = 0;

		// if(typeof this.before === 'function') {
		// 	if(this.before.length < 2) {
		// 		this.before(this.count);
		// 		this.beforeDone();
		// 	} else this.before(this.count, this.beforeDone.bind(this));
		// } else this.beforeDone();
	}
}

module.exports = WalkTheLine;