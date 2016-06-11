'use strict';

var should = require('should'),
	WalkTheLine = require('../index');

console.log(WalkTheLine);
describe('Walk the Line', function() {
	describe('runtime', function() {
		it('should throw an error when run() called without filename', function() {
			let inst = new WalkTheLine();
			inst.run.bind(inst).should.throw();
		})
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
	})
})