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
		it('should have the headerline available as a property if the headerline option is set to true', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.csv',
				'headerline': true
			})
			inst.line = function(lineIndex, numLines, line) {
				this.headerline.should.equal('Headerline');
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should have a null value for headerline if the headerline option is not set to true', function(done) {
			let inst = new WalkTheLine({
				'source': './test-data/test-file.csv'
			})
			inst.line = function(lineIndex, numLines, line) {
				should.not.exist(this.headerline);
			}
			inst.end = function() {
				done();
			}
			inst.run();
		})
		it('should allow for an empty plugins', (done) => {
			const inst = new WalkTheLine({
				'source': './test-data/test-file.csv',
				'plugins': {
					// empty
				}
			})
			inst.end = () => {
				done()
			}
			inst.run();
		})
		it('should not allow for a plugin name that doesn\'t exist', () => {
			const inst = new WalkTheLine({
				'source': './test-data/test-file.csv',
				'plugins': {
					'fakeplugin': {}
				}
			})
			inst.run.bind(inst).should.throw('Unable to create plugin with name fakeplugin');
		})
		it('should create a plugin if the file exists in the plugin directory', (done) => {
			const inst = new WalkTheLine({
				'source': './test-data/test-file.csv',
				'plugins': {
					'progress': {}
				}
			})
			inst.start = function() {
				should.exist(this.plugins.progress);
			}			
			inst.end = () => {
				done()
			}
			inst.run();			
		})
	})
})