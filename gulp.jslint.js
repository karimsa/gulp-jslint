/**
 * gulp.jslint.js
 * Copyright (C) 2014 KarimSa Networks.
 **/
/*globals JSLINT*/

(function (global) {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        evtStr = require('event-stream'),
        initLint = function (fn) {
            var lintPath = path.resolve(__dirname, './node_modules/JSLint/jslint.js');

            fs.readFile(lintPath, 'utf8', function (err, jslintjs) {
                if (err) {
                    fn(err);
                } else {
                    // hope JSLINT is not "evil"
                    eval(jslintjs + '; global.JSLINT = JSLINT; ');

                    // launch callback
                    fn(null);
                }
            });
        },
        doLint = function (options) {
            return function (src, fn) {
                var retVal, js, error, i,
                    lint = function (err) {
                        var myRet;

                        if (err || !global.JSLINT) {
                            myRet = fn(err || 'jslint: failed to load JSLINT.');
                        } else {
                            // convert to string
                            js = src.contents.toString('utf8');

                            // lint the file
                            if (!global.JSLINT(js, options)) {
                                error = 'jslint: failed to lint: ' + src.path.replace(path.resolve(__dirname) + '/', '') + '.';

                                for (i = 0; i < global.JSLINT.errors.length; i += 1) {
                                    if (global.JSLINT.errors[i]) {
                                        error += '\njslint: ' + global.JSLINT.errors[i].line + ': ' + global.JSLINT.errors[i].character + ': ' + global.JSLINT.errors[i].reason;
                                    }
                                }

                                myRet = fn(new Error(error));
                            } else {
                                myRet = fn(null, src);
                            }
                        }

                        return myRet;
                    };

                if (src.isStream()) {
                    retVal = fn(new Error('jslint: bad file input.'));
                } else {
                    if (!src.isNull()) {
                        if (!global.JSLINT) {
                            retVal = initLint(lint);
                        } else {
                            retVal = lint(null);
                        }
                    }

                    return retVal;
                }
            };
        };

    module.exports = function (options) {
        return evtStr.map(doLint(options || {}));
    };
}(this));