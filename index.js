'use strict';

var _ = require('lodash'),
	fs = require('fs');

class WalkTheLine {
	constructor(filename, opts) {
		this.filename = filename;
		this.options = _.defaults({}, opts, {

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

	run() {
		if (!this.filename) throw new Error('No filename set');

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