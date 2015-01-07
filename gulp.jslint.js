/**
 * gulp.jslint.js
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    // load up colorful strings
    require('colors');

    var path = require('path'),
        gutil = require('gulp-util'),
        evtStr = require('event-stream'),
        jslint = require('jslint'),
        applyRC = function (options) {
            var tmp = {},
                i;

            try {
                // evil code helps get
                // past jslint's hatred of
                // synchronous node.js code

                /*jslint evil:true*/
                tmp = eval("JSON.parse(require('fs').readFileSync(path.resolve('.', '.jslintrc'), 'utf8'))");
                /*jslint evil:false*/
            } finally {
                for (i in options) {
                    if (options.hasOwnProperty(i)) {
                        tmp[i] = options[i];
                    }
                }

                return tmp;
            }
        },
        JSLINT = null,
        doLint = function (options) {
            return function (src, fn) {
                var retVal, js,
                    lint = function () {
                        var myRet;

                        // prepare for linting exports
                        src.jslint = {};

                        // convert to string
                        js = src.contents.toString('utf8');

                        // check for shebang
                        if (js.substr(0, js.indexOf('\n')).match(/^#! ?/)) {
                            js = js.replace(js.split('\n', 1) + '\n', '');
                        }

                        // lint the file
                        src.jslint.edition = JSLINT.edition;
                        src.jslint.success = JSLINT(js, options);
                        src.jslint.errors = JSLINT.errors;

                        // only support paths to reporter, or
                        // pre-loaded reporters
                        if (options.reporter !== 'default') {
                            try {
                                if (typeof options.reporter === 'string') {
                                    options.reporter = require(options.reporter);
                                } else if (typeof options.reporter !== 'function') {
                                    options.reporter = 'default';
                                }
                            } catch (err_a) {
                                return fn(err_a);
                            }
                        }

                        // load the default reporter
                        if (options.reporter === 'default') {
                            options.reporter = function (evt) {
                                var msg = '       ',
                                    i;

                                // shorten path
                                evt.file = evt.file.replace(path.join(path.resolve('./'), '/'), '');

                                // colorify
                                evt.file = evt.pass ? evt.file.green : evt.file.red;

                                // print file name
                                msg += evt.file;

                                // add reasons to errors
                                if (!evt.pass) {
                                    for (i = 0; i < evt.errors.length; i += 1) {
                                        if (evt.errors[i]) {
                                            msg += ('\n           ' +
                                                evt.errors[i].line + ':' +
                                                evt.errors[i].character + ': ' +
                                                evt.errors[i].reason).red;
                                        }
                                    }
                                }

                                // write to screen
                                if (!(evt.pass && options.errorsOnly)) {
                                    gutil.log(msg);
                                }
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
                            myRet = fn(new gutil.PluginError('gulp-jslint', 'failed to lint ' + src.path));
                        }

                        return myRet;
                    };

                if (src.isStream()) {
                    retVal = fn(new gutil.PluginError('gulp-jslint', 'bad input file ' + src.path));
                } else if (src.isNull()) {
                    retVal = fn(null, src);
                } else {
                    if (JSLINT === null) {
                        JSLINT = jslint.load(options.edition);
                    }

                    retVal = lint();
                }

                return retVal;
            };
        };

    module.exports = function (options) {
        // fallback to empty object
        options = options || {};

        // extend .jslintrc; give options
        // the priority for directives
        options = applyRC(options);

        // set default reporter
        options.reporter = options.reporter || 'default';

        // force boolean
        options.errorsOnly = options.hasOwnProperty('errorsOnly') && options.errorsOnly === true;

        // use 'global' for consistency
        // prefer 'predef' because of JSLint
        options.predef = options.predef || options.global || {};

        // allow freezing of jslint edition
        options.edition = options.edition || 'latest';

        // begin linting
        return evtStr.map(doLint(options));
    };
}());
