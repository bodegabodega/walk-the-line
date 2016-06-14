#!/usr/bin/env node

var Wtl = require('./index');

var w = new Wtl('./test-data/test-file.txt');
w.before = function(count, done) {
	console.log('start');
	done();
}
w.line = function(index, count, line, done) {
	console.log(index, count, line);
	// throw new Error('yay');
	setTimeout(done, 2000);
}
w.after = function() {
	console.log('end');
}
w.run();