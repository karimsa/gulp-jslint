/**
 * gulp.jslint.js
 * Copyright (C) 2014 KarimSa Networks.
 **/

(function () {
    "use strict";

    // load up colorful strings
    require('colors');

    var path = require('path'),
        evtStr = require('event-stream'),
        jslint = require('jslint'),
        JSLINT = null,
        doLint = function (options) {
            return function (src, fn) {
                var retVal, js,
                    lint = function (err) {
                        var myRet;

                        // prepare for linting exports
                        src.jslint = {};

                        if (err || !JSLINT) {
                            myRet = fn(err || new Error('gulp-jslint: failed to load JSLINT.'));
                        } else {
                            // convert to string
                            js = src.contents.toString('utf8');

                            // lint the file
                            src.jslint.edition = JSLINT.edition;
                            src.jslint.success = JSLINT(js, options);
                            src.jslint.errors = JSLINT.errors;

                            if (options.reporter !== 'default') {
                                // only support paths to reporter, or
                                // pre-loaded reporters
                                try {
                                    if (typeof options.reporter === 'string') {
                                        options.reporter = require(options.reporter);
                                    } else if (typeof options.reporter !== 'function') {
                                        options.reporter = 'default';
                                    }
                                } catch (err_a) {
                                    fn(err_a);
                                }
                            }

                            // load the default reporter
                            if (options.reporter === 'default') {
                                options.reporter = function (data) {
                                    // attach status
                                    var msg = '[' + (data.pass ? 'PASS'.green : 'FAIL') + '] ',
                                        i;

                                    // shorten path name
                                    data.file = data.file.replace(path.join(path.resolve('./'), '/'), '');

                                    if (!data.pass) {
                                        msg += data.file;

                                        // add reasons to errors
                                        for (i = 0; i < data.errors.length; i += 1) {
                                            if (data.errors[i]) {
                                                msg += '\n       line ' + data.errors[i].line +
                                                    ', col ' + data.errors[i].character +
                                                    ': ' + data.errors[i].reason;
                                            }
                                        }

                                        // redify
                                        msg = msg.red;
                                    } else {
                                        msg += data.file.cyan;
                                    }

                                    // print out
                                    console.log(msg);
                                };
                            }

                            // pass error handling onto reporter
                            options.reporter({
                                pass: src.jslint.success,
                                file: src.path,
                                errors: JSLINT.errors
                            });

                            // decide where to go
                            if (src.jslint.success) {
                                myRet = fn(null, src);
                            } else {
                                fn(new Error('gulp-jslint: failed to lint file.'));
                            }
                        }

                        return myRet;
                    };

                if (src.isStream()) {
                    retVal = fn(new Error('gulp-jslint: bad file input.'));
                } else {
                    if (!src.isNull()) {
                        if (JSLINT === null) {
                            JSLINT = jslint.load('latest');
                        }

                        retVal = lint(null);
                    }

                    return retVal;
                }
            };
        };



    module.exports = function (options) {
        // fallback to object
        options = options || {};

        // set default reporter
        options.reporter = options.reporter || 'default';

        // force boolean
        options.errorsOnly = options.hasOwnProperty('errorsOnly') && options.errorsOnly === true;

        // begin linting
        return evtStr.map(doLint(options));
    };
}());