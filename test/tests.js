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
			inst.files.length.should.equal(3)
		})
		it('should allow an extension to be set to filter the directory', function() {
			let inst = new WalkTheLine({
				'source': './test-data/',
				'extension': 'txt'
			});
			inst.run();
			inst.files.should.be.an.Array();
			inst.files.length.should.equal(2)
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