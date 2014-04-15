/**
 * Gulpfile.js
 * For build instructions, please see README.md.
 *
 * Copyright (C) 2014 KarimSa Networks.
 **/

(function () {
    "use strict";

    // import colors to use 'red'
    // (adds to String.prototype)
    require('colors');

    var gulp = require('gulp'),
        jslint = require('./gulp.jslint.min.js'),
        uglify = require('gulp-uglify'),
        concat = require('gulp-concat'),

        // prepare an error handler
        // (or use this)
        onFail = function (err) {
            console.error(String(err).red);
            process.exit(-1);
        };

    gulp.task('default', function () {
        gulp.src(['Gulpfile.js'])
            .pipe(jslint({ node: true }))
            .on('error', onFail);

        // remember to keep gulp
        // chaining and streaming.
        return gulp.src(['gulp.jslint.js'])

            // pass your directives
            // as an object
            .pipe(jslint({
                node: true,
                evil: true,
                nomen: true
            }))

            // handle failures on your own
            // see (on github):
            //  - gulpjs/gulp#113
            //  - spenceralger/gulp-jshint#10
            .on('error', onFail)

            // do your other things
            .pipe(uglify({ output: { comments: /copyright/i } }))
            .pipe(concat('gulp.jslint.min.js'))
            .pipe(gulp.dest('./'));
    });
}());