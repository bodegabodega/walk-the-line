'use strict';

var _ = require('lodash'),
	fs = require('fs'),
	glob = require('glob');

class WalkTheLine {
	constructor(opts) {
		this.options = _.defaults({}, opts, {
			'extension': ''
		});
	}

	beforeDone() {
		this.startLine();
	}

	startLine() {
		let line = this.lines[this.index];
		if(typeof this.line === 'function') {
			if (this.line.length < 4) {
				this.line(this.index, this.count, line);
				this.lineDone();
			} else this.line(this.index, this.count, line, this.lineDone.bind(this));
		} else this.lineDone();
	}

	lineDone() {
		this.index++;

		if(this.index >= this.count) {
			if (typeof this.after === 'function') {
				this.after();
			}
		} else this.startLine();
	}

	/**
	 * Initiates the process
	 */
	run() {
		if (!this.options.source) throw new Error('No source set');

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
		return;

		this.lines = fs.readFileSync(this.filename, 'utf8').split('\n');
		this.count = this.lines.length;
		this.index = 0;

		if(typeof this.before === 'function') {
			if(this.before.length < 2) {
				this.before(this.count);
				this.beforeDone();
			} else this.before(this.count, this.beforeDone.bind(this));
		} else this.beforeDone();
	}
}

module.exports = WalkTheLine;