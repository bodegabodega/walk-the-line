'use strict';

var ProgressBar = require('progress');

class Progress {
  constructor(opts) {
		this._options = opts || {};
  }

  fileStart(filename, numLines) {
    this.filename = filename;
    const tpl = this._options.template || ':filename :bar :percent :eta';
    this._bar = new ProgressBar(tpl, { total: numLines });
  }

  line(index, numLines, line) {
    this._bar.tick({
      filename: this.filename
    });
  }
}

module.exports = Progress;