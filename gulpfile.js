/**
 * gulpfile.js
 * For build instructions, please see README.md.
 *
 * Copyright (C) 2014 KarimSa Networks.
 **/

(function () {
    "use strict";

    var gulp = require('gulp'),
        jslint = require('./gulp.jslint.js');

    // lint all code
    gulp.task('default', function () {
        return gulp.src(['gulpfile.js', 'gulp.jslint.js'])

            // pass your directives
            // as an object
            .pipe(jslint({
                // these directives can
                // be found in the official
                // JSLint documentation.
                node: true,
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
}());
