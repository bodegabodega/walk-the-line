# Walk the Line

I often find myself writing scripts that need to pick up a file and do a bit of processing on each line. Walk the Line is my attempt at creating a reusable object that does the dirty work.

## Installation

```
npm install --save-dev walk-the-line
```

## Example

```javascript
var WalkTheLine = require('walk-the-line');

// Create an instance
let wtl = new WalkTheLine({
	'source': './path/to-your/file.txt', // may be a file or a directory
	'extension': 'txt', // if source is a directory and extension is set, it will only include that type
	'headerline': true, // if set to true, the files don't call the line() method for the first line and you can access the headerline on the instance during the file processing
	'plugins': { // list of plugins
		'progress': { // only plugin we have so far
			'template': ':bar' // passed thru to https://github.com/visionmedia/node-progress
		}
	}
});

/**
 * Create a start() method if you want to do anything when the process starts.
 * This is only ever called once for the run.
 *
 * The start() method can recieve 2 optional parameters:
 * 1. numFiles - The number of files being processed
 * 2. done - If defined, call the done method when you're done doing async stuff
 */
wtl.start = function(numFiles, done) {
	console.log(`Processing ${numFiles} files`);

	doSomethingAsync(function(){
		done();
	});
}

/**
 * Create a fileStart() method if you want to do anything before you start each file.
 *
 * The fileStart() method can recieve 3 optional parameters:
 * 1. filename - The name of the file
 * 2. numLines - The number of lines in the file
 * 3. done - If defined, call the done method when you're done doing async stuff
 */
wtl.fileStart = function(filename, numLines, done) {
	console.log(`Processing ${filename} with ${numLines} lines`);
	console.log(this.headerline); // available if you have set headerline to true in the options

	doSomethingAsync(function(){
		done();
	})
}

/**
 * Create a line method which will be called for each line of the file.
 *
 * The line method can recieve optional parameters:
 * 1. index - The zero-indexed number of the line being processed
 * 2. count - The number of lines in the file
 * 3. line - The content of the line
 * 4. done - If defined, call the done method when you're done doing async stuff
 */
wtl.line = function(index, numLines, line, done) {
	console.log(`Processing line ${index} of ${numLines}`);

	doSomethingAsync(line, function(){
		done();
	})
}

/**
 * Creat a fileEnd() method if you'd like to do something after each file is read.
 *
 * The fileEnd() method can recieve 2 optional parameters:
 * 1. filename - The name of the file
 * 2. done - If defined, call the done method when you're done doing async stuff
 */
wtl.fileEnd = function(filename, done) {
	console.log(`Finished processing ${filename}`);

	doSomethingAsync(function(){
		done();
	})
}

/**
 * Create an after method if you want to do anything after you have processed the lines.
 * This method takes no parameters.
 */
wtl.end = function() {
	console.log('Nice work everyone');
}

// Run it!
wtl.run();
```

## Tests

I don't think I write great tests but I've done so to the best of my ability to make you happy.

```
mocha
```