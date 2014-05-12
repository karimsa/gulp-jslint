# gulp-jslint [![Build Status](http://img.shields.io/travis/karimsa/gulp-jslint.svg?style=flat)](https://travis-ci.org/karimsa/gulp-jslint) [![View on NPM](http://img.shields.io/npm/dm/gulp-jslint.svg?style=flat)](http://npmjs.org/package/gulp-jslint)
It's JSLint for Gulp.js.

## Usage

To install with npm, simply do:

```
$ npm install gulp-jslint
.. installs gulp-jslint ..
```

Sample Gulpfile.js:

```javascript
var gulp = require('gulp');
var jslint = require('gulp-jslint');
var uglify = require('gulp-uglify');

gulp.task('default', function () {
    return gulp.src(['my_files.js'])
            .pipe(jslint({
                // pass all directives as an object here
                // like so:
                
                nomen: true,
                white: true,
                
                // specify your own reporter module
                // (by-name), or use the built-in one:
                
                reporter: 'default',
                errorsOnly: false
                
                // ^ there's no need to tell gulp-jslint
                // to use the default reporter. If there is
                // no reporter specified, gulp-jslint will use
                // its own.
            }))
            .pipe(uglify())
            .pipe(gulp.dest('built'));
});
```

When not specified, the default reporter will write a pass/fail message to the console with every file.  If you only wish to see errors, set the `errorsOnly` property to `true`.  *Note:* The `errorsOnly` property only affects the default reporter.

For a list of directives, see [the official JSLint docs](http://www.jslint.com/lint.html).

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
All forks and helpful comments are much appreciated. :D
