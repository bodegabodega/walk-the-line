'use strict';

var should = require('should'),
	WalkTheLine = require('../index');

describe('Walk the Line', function() {
	describe('runtime', function() {
		it('should throw an error when run() called without a source', function() {
			let inst = new WalkTheLine();
			inst.run.bind(inst).should.throw('No source set');
		})
		it('should throw an error when run() called with a non-existent source', function() {
			let inst = new WalkTheLine({
				'source': './not-a-resource'
			});
			inst.run.bind(inst).should.throw('Unable to access source');
		})
		it('should be able to correctly handle a source that is a file', function() {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.txt'
			});
			inst.run();
			inst.files.should.be.an.Array();
			inst.files.length.should.equal(1)
		})
		it('should handle a source that is a directory that doesn\'t end with a /', function() {
			let inst = new WalkTheLine({
				'source': './test-data'
			});
			inst.run();
			inst.files.should.be.an.Array();
			inst.files.length.should.equal(3)
		})
		it('should handle a source that is a directory that ends with a /', function() {
			let inst = new WalkTheLine({
				'source': './test-data/'
			});
			inst.run();
			inst.files.should.be.an.Array();
			inst.files.length.should.equal(3);
		})
		it('should allow an extension to be set to filter the directory', function() {
			let inst = new WalkTheLine({
				'source': './test-data/',
				'extension': 'txt'
			});
			inst.run();
			inst.files.should.be.an.Array();
			inst.files.length.should.equal(2);
		})
		it('should not throw an error if any of the processing methods are not defined', function(){
			let inst = new WalkTheLine({
				'source': './test-data/test-file.txt'
			});
			inst.run.bind(inst).should.not.throw();
		})
		it('should call start() with the file count if the method is defined with 1 argument', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data'
			});
			inst.start = function(count) {
				count.should.equal(3);
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call start() with the file count and a done callback if the method is defined with 2 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data'
			});
			inst.start = function(count, startDone) {
				count.should.equal(3);
				done.should.be.a.Function();
				startDone();
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call fileStart() with the filename and line count if the method is defined with 2 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.txt'
			});
			inst.fileStart = function(filename, numLines) {
				filename.should.match(/test\-data\/test\-file/);
				numLines.should.equal(4);
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call fileStart() with the filename, line count and a done callback if the method is defined with 3 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.txt'
			});
			inst.fileStart = function(filename, numLines, fileStartDone) {
				filename.should.match(/test\-data\/test\-file/);
				numLines.should.equal(4);
				fileStartDone.should.be.a.Function();
				fileStartDone();
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call line() with the line index, line count and line if the method is defined with 3 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data',
				'extension': 'txt'
			});
			inst.line = function(lineIndex, numLines, line) {
				lineIndex.should.be.a.Number();
				numLines.should.equal(4);
				line.should.match(/Line$/);
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call line() with the line index, line count, line and a done callback if the method is defined with 4 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data',
				'extension': 'txt'
			});
			inst.line = function(lineIndex, numLines, line, lineDone) {
				lineIndex.should.be.a.Number();
				numLines.should.equal(4);
				line.should.match(/Line$/);
				lineDone.should.be.a.Function();
				lineDone();
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call fileEnd() with the filename if the method is defined with 1 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data'
			});
			inst.fileEnd = function(filename) {
				filename.should.match(/test\-data\/test\-file/);
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call fileEnd() with the filename and a done callback if the method is defined with 2 arguments', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data'
			});
			inst.fileEnd = function(filename, fileEndDone) {
				filename.should.match(/test\-data\/test\-file/);
				done.should.be.a.Function();
				fileEndDone();
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should call the methods in the proper order', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.csv'
			})
			inst.start = function() {
				this.tracker = ['start'];
			}
			inst.fileStart = function() {
				this.tracker.push('fileStart');
			}
			inst.line = function() {
				this.tracker.push('line');
			}
			inst.fileEnd = function() {
				this.tracker.push('fileEnd');
			}
			inst.end = function() {
				this.tracker.push('end');

				let trackers = this.tracker.join(' ');
				trackers.should.equal('start fileStart line line fileEnd end');

				done();
			}
			inst.run();
		})
		it('should not include the first line of the file if the headerline option is set to true', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.csv',
				'headerline': true
			})
			inst.line = function(lineIndex, numLines, line) {
				line.should.equal('Sample Line');
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		/*
		it('should not throw an error if a before() method is not defined', function(){
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.run.bind(inst).should.not.throw();
		})
		it('should call before() with the line count if the method is defined with 1 argument', function() {
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.before = function(count) {
				count.should.equal(4);
			}
			inst.run();
		})
		it('should call before() with the line count and a done callback if the method is defined with 2 arguments', function() {
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.before = function(count, done) {
				count.should.equal(4);
				done.should.be.a.Function();
			}
			inst.run();
		})
		it('should not throw an error if a before() method is not defined', function(){
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.run.bind(inst).should.not.throw();
		})
		it('should call line() with the index, line count and line if the method is defined with 3 arguments', function() {
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.line = function(index, count, line) {
				index.should.be.a.Number();
				count.should.equal(4);
				line.should.be.a.String();
			}
			inst.run();
		})
		it('should allow you to assign values to this during the before() method that are accessible during the each() and after() method', function(){
			let inst = new WalkTheLine('./test-data/test-file.txt');
			inst.before = function() { this.foo = 'bar'; }
			inst.line = function() { this.foo.should.equal('bar'); }
			inst.after = function() { this.foo.should.equal('bar'); }
			inst.run();
		})
		*/
	})
})