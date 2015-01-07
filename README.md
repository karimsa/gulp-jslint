# gulp-jslint [![Build Status](http://img.shields.io/travis/karimsa/gulp-jslint.svg?style=flat)](https://travis-ci.org/karimsa/gulp-jslint) [![View on NPM](http://img.shields.io/npm/dm/gulp-jslint.svg?style=flat)](http://npmjs.org/package/gulp-jslint) [![code climate](http://img.shields.io/codeclimate/github/karimsa/gulp-jslint.svg?style=flat)](https://codeclimate.com/github/karimsa/gulp-jslint) [![code coverage](http://img.shields.io/codeclimate/coverage/github/karimsa/gulp-jslint.svg?style=flat)](https://codeclimate.com/github/karimsa/gulp-jslint)
It's JSLint for Gulp.js.

[![NPM](https://nodei.co/npm/gulp-jslint.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-jslint/)

## Usage

To install with npm, simply do:

```
$ npm install gulp-jslint
.. installs gulp-jslint ..
```

Sample gulpfile.js:

```javascript
var gulp = require('gulp');
var jslint = require('gulp-jslint');

// build the main source into the min file
gulp.task('default', function () {
    return gulp.src(['source.js'])

        // pass your directives
        // as an object
        .pipe(jslint({
            // these directives can
            // be found in the official
            // JSLint documentation.
            node: true,
            evil: true,
            nomen: true,

            // you can also set global
            // declarations for all source
            // files like so:
            global: [],
            predef: [],
            // both ways will achieve the
            // same result; predef will be
            // given priority because it is
            // promoted by JSLint

            // pass in your prefered
            // reporter like so:
            reporter: 'default',
            // ^ there's no need to tell gulp-jslint
            // to use the default reporter. If there is
            // no reporter specified, gulp-jslint will use
            // its own.

            // specifiy custom jslint edition
            // by default, the latest edition will
            // be used
            edition: '2014-07-08',

            // specify whether or not
            // to show 'PASS' messages
            // for built-in reporter
            errorsOnly: false
        }))

        // error handling:
        // to handle on error, simply
        // bind yourself to the error event
        // of the stream, and use the only
        // argument as the error object
        // (error instanceof Error)
        .on('error', function (error) {
            console.error(String(error));
        });
});
```

When not specified, the default reporter will write a pass/fail message to the console with every file.  If you only wish to see errors, set the `errorsOnly` property to `true`.  *Note:* The `errorsOnly` property only affects the default reporter.

For a list of directives, see [the official JSLint docs](http://www.jslint.com/lint.html).

### Custom Reporters
A custom reporter is simply a function that receives a JSON object with 2 properties:
- `pass`: a boolean (true/false) of whether the lint was successful.
- `file`: an absolute path to the file.

Sample Gruntfile with a custom reporter:
```javascript
var gulp = require('gulp');
var jslint = require('gulp-jslint');

gulp.task('default', function () {
    return gulp.src(['my_source.js'])
            .pipe(jslint({
                reporter: function (evt) {
                    var msg = ' ' + evt.file;
                    
                    if (evt.pass) {
                        msg = '[PASS]' + msg;
                    } else {
                        msg = '[FAIL]' + msg;
                    }
                    
                    console.log(msg);
                }
            }));
});
```

It's probably a good idea to use something like `path.basename()` on the `file` property to avoid lots of garbage in the command-line (i.e. path.basename('/home/user/documents/projects/my-project/index.js') === 'index.js').

## Custom Install
To build from source, simply do the following:

```
$ git clone https://github.com/karimsa/gulp-jslint.git
.. clones gulp-jslint ..
$ cd gulp-jslint
$ npm install
.. installs dependencies ..
$ npm test
.. lints and tests gulp-jslint code ..
```

## Support
Please use the official issues section in GitHub to post issues.
All forks and helpful comments are much appreciated.
