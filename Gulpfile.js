/**
 * Gulpfile.js
 * For build instructions, please see README.md.
 *
 * Copyright (C) 2014 KarimSa Networks.
 **/
/*jslint node:true*/

"use strict";

var gulp = require('gulp'),
    jslint = require('./gulp.jslint.min.js'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

// test our Gulpfile in a separate task,
// to maintain gulp's streaming output.
gulp.task('gulpfile', function () {
    return gulp.src(['Gulpfile.js']).pipe(jslint());
});

// build the main source into the min file
// and use the last working minified version
// to lint the current.
gulp.task('default', ['gulpfile'], function () {
    return gulp.src(['gulp.jslint.js'])

        // pass your directives
        // as an object
        .pipe(jslint({
            // pass in your prefered
            // reporter like so:
            reporter: 'default'
        }))

        // do your other things
        .pipe(uglify({ output: { comments: /copyright/i } }))
        .pipe(concat('gulp.jslint.min.js'))
        .pipe(gulp.dest('./'));
});
