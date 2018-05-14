'use strict';

var ProgressBar = require('progress');

class Progress {
  constructor(opts) {
		this._options = opts || {};
  }

  fileStart(filename, numLines) {
    const tpl = this._options.template || ':bar :percent :eta';
    this._bar = new ProgressBar(tpl, { total: numLines });
  }

  line(index, numLines, line) {
    this._bar.tick();
  }
}

module.exports = Progress;