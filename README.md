# gulp-jslint [![Build Status](https://travis-ci.org/karimsa/gulp-jslint.svg?branch=master)](https://travis-ci.org/karimsa/gulp-jslint)
It's JSLint for Gulp.js.

[![NPM](https://nodei.co/npm/gulp-jslint.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-jslint/)

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
                
                reporter: 'default'
                
                // ^ there's no need to tell gulp-jslint
                // to use the default reporter. If there is
                // no reporter specified, gulp-jslint will use
                // its own.
            }))
            .pipe(uglify())
            .pipe(gulp.dest('built'));
});
```

For a list of directives, see [the official JSLint docs](http://www.jslint.com/lint.html).

## Custom Install
To build from source, simply do the following:

```
$ git clone https://github.com/karimsa/gulp-jslint.git
.. clones gulp-jslint ..
$ cd gulp-jslint
$ npm install
.. installs dependencies ..
$ gulp
.. builds gulp-jslint into gulp.jslint.min.js ..
```

## Support
Please use the official issues section in GitHub to post issues.
All forks and helpful comments are much appreciated. :D