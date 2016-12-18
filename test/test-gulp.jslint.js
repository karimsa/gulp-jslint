/**
 * test-gulp.jslint
 * Some basic tests to ensure that
 * package is working as intended.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        test = require('tape'),
        Vinyl = require('vinyl'),
        stripCodes = require('strip-ansi'),
        util = require('util'),
        jslint = require('../'),
        nodelint = require('jslint').load('latest'),
        lint = function (why, file, dir, edition) {
            var goodCode = true;

            // directives
            dir = dir || {};
            dir.edition = edition || 'latest';

            // create test
            test(why, function (t) {
                t.plan(1);

                // create stream with custom reporter
                var str = jslint(dir);
                str.pipe(jslint.reporter(function (evt) {
                    if (goodCode && evt.success) {
                        t.ok(true, 'lint passed (' + file + ')');
                    }
                }));

                // read in sample file
                fs.readFile(path.resolve(__dirname, './' + file), function (err, data) {
                    if (err) {
                        t.fail(err);
                    } else {
                        // prepare callback
                        str.on('error', function (err) {
                            err = String(err);

                            if (err.indexOf('failed') === -1) {
                                t.fail(err);
                            }
                        });

                        // push file into stream
                        try {
                            str.write(new Vinyl({
                                base: __dirname,
                                cwd: path.resolve(__dirname, '../'),
                                path: path.join(__dirname, file),
                                contents: data
                            }));
                        } catch (ignore) {
                            t.ok(!goodCode, 'lint failed (' + file + ')');
                        }
                    }
                });
            });

            // allow test to expect failure
            return {
                fail: function () {
                    goodCode = false;
                }
            };
        };

    lint('with good code', 'test-good.js');
    lint('with bad code', 'test-eval.js').fail();
    lint('with directives', 'test-eval.js', {
        eval: true
    });
    lint('with good code (with shebang)', 'test-shebang.js', {
        node: true
    });
    lint('with good code (missing globals)', 'test-jquery.js').fail();
    lint('with good code (given globals)', 'test-jquery.js', {
        global: ['$']
    });
    lint('with good code (given predef)', 'test-jquery.js', {
        predef: ['$']
    });

    // retest lints by explicitally providing the jslint function

    lint('with good code', 'test-good.js', {}, nodelint);
    lint('with bad code', 'test-eval.js', {}, nodelint).fail();
    lint('with directives', 'test-eval.js', {
        eval: true
    }, nodelint);
    lint('with good code (with shebang)', 'test-shebang.js', {
        node: true
    }, nodelint);
    lint('with good code (missing globals)', 'test-jquery.js', {}, nodelint).fail();
    lint('with good code (given globals)', 'test-jquery.js', {
        global: ['$']
    }, nodelint);
    lint('with good code (given predef)', 'test-jquery.js', {
        predef: ['$']
    }, nodelint);

    test('stream support', function (t) {
        t.plan(1);

        var str = jslint();

        str.on('error', function () {
            t.ok(true, 'errored out on stream');
        });

        str.write({
            isNull: function () {
                return false;
            },
            isStream: function () {
                return true;
            }
        });
    });

    test('null input', function (t) {
        t.plan(1);

        var str = jslint();

        str.on('data', function () {
            t.ok(true, 'ignored null');
        });

        str.on('error', function () {
            t.ok(false, 'errored out on null');
        });

        str.write({
            isStream: function () {
                return false;
            },
            isNull: function () {
                return true;
            }
        });
    });

    test('default reporter logs success', function (t) {
        t.plan(1);

        var log = console.log;
        console.log = function () {
            console.log = log;
            t.equal(stripCodes(util.format.apply(util, arguments)), ' ✓ test-good.js', 'linting passes');
        };

        var str = jslint();
        str.pipe(jslint.reporter('default'));

        fs.readFile(path.resolve(__dirname, './test-good.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                str.write(new Vinyl({
                    base: __dirname,
                    cwd: path.resolve(__dirname, '../'),
                    path: path.join(__dirname, 'test-good.js'),
                    contents: data
                }));
            }
        });
    });

    test('default reporter hides success (errorsOnly = true)', function (t) {
        t.plan(1);

        var log = console.log;
        console.log = function () {
            console.log = log;
            t.fail('should not print anything');
        };

        var str = jslint();
        str.pipe(jslint.reporter('default', true));
        str.on('data', function () {
            console.log = log;
            t.ok(true, 'should not print anything');
        });

        fs.readFile(path.resolve(__dirname, './test-good.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                str.write(new Vinyl({
                    base: __dirname,
                    cwd: path.resolve(__dirname, '../'),
                    path: path.join(__dirname, 'test-good.js'),
                    contents: data
                }));
            }
        });
    });

    test('default reporter logs failure', function (t) {
        t.plan(4);

        var log = console.log, array = [];
        console.log = function () {
            array.push(stripCodes(util.format.apply(util, arguments)));
            if (array.length === 2) {
                console.log = log;
                t.equal(array[0].trim(), '✖ test-eval.js', 'should output file name');

                var parts = array[1].trim().substr(1).split(':').map(function (part) {
                    return part.trim();
                });

                t.equal(parts[0], '3', 'should output proper line');
                t.equal(parts[1], '4', 'should output proper column number');
                t.equal(parts[2], 'Unexpected \'eval\'.', 'should output proper reason');
            }
        };

        var str = jslint();
        str.pipe(jslint.reporter('default'));

        fs.readFile(path.resolve(__dirname, './test-eval.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                try {
                    str.write(new Vinyl({
                        base: __dirname,
                        cwd: path.resolve(__dirname, '../'),
                        path: path.join(__dirname, 'test-eval.js'),
                        contents: data
                    }));
                } catch (ignore) {}
            }
        });
    });

    test('custom reporter via string', function (t) {
        t.plan(4);

        var str = jslint();
        str.pipe(jslint.reporter(require('./test-reporter')));

        str.on('data', function () {
            t.ok(!!global.GULP_JSLINT_REPORTER, 'reporter fired');
            t.ok(global.GULP_JSLINT_REPORTER.hasOwnProperty('filename'), 'source file is in event data');
            t.ok(global.GULP_JSLINT_REPORTER.hasOwnProperty('success'), 'lint status is in event data');
            t.ok(global.GULP_JSLINT_REPORTER.hasOwnProperty('errors'), 'errors list is in event data');
        });

        fs.readFile(path.resolve(__dirname, './test-good.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                str.write(new Vinyl({
                    base: __dirname,
                    cwd: path.resolve(__dirname, '../'),
                    path: path.join(__dirname, 'test-good.js'),
                    contents: data
                }));
            }
        });
    });

    test('custom reporter via function', function (t) {
        t.plan(4);

        var str = jslint();
        str.pipe(jslint.reporter(function (evt) {
            t.ok(!!evt, 'reporter fired');
            t.ok(evt.hasOwnProperty('filename'), 'source file is in event data');
            t.ok(evt.hasOwnProperty('success'), 'lint status is in event data');
            t.ok(evt.hasOwnProperty('errors'), 'errors list is in event data');
        }));

        fs.readFile(path.resolve(__dirname, './test-good.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                str.write(new Vinyl({
                    base: __dirname,
                    cwd: path.resolve(__dirname, '../'),
                    path: path.join(__dirname, 'test-good.js'),
                    contents: data
                }));
            }
        });
    });

    test('custom bad reporter (object)', function (t) {
        t.plan(1);
        t.throws(function () {
            var str = jslint();
            str.pipe(jslint.reporter({
                what: 'this object should be ignored'
            }));
        }, 'path must be a string');
    });

    test('custom bad reporter (missing module)', function (t) {
        t.plan(1);
        t.throws(function () {
            var str = jslint();
            str.pipe(jslint.reporter('some-random-ass-reporter'));
        }, 'Cannot find module \'some-random-ass-reporter\'');
    });
}());
