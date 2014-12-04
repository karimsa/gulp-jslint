/**
 * test-gulp.jslint
 * Some basic tests to ensure that
 * package is working as intended.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/
/*jslint nomen:true*/

(function () {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        strip = require('stripcolorcodes'),
        test = require('tape'),
        Vinyl = require('vinyl'),
        jslint = require('../gulp.jslint.js'),
        lint = function (why, file, dir) {
            var goodCode = true;

            // directives
            dir = dir || {};

            // create test
            test(why, function (t) {
                t.plan(1);

                // hook in custom reporter
                dir.reporter = function (evt) {
                    if (goodCode && evt.pass) {
                        t.ok(true, 'lint passed (' + file + ')');
                    } else {
                        t.ok(!goodCode, 'lint failed (' + file + ')');
                    }
                };

                // create stream
                var str = jslint(dir);

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
                        str.write(new Vinyl({
                            base: __dirname,
                            cwd: path.resolve(__dirname, '../'),
                            path: path.join(__dirname, file),
                            contents: data
                        }));
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
    lint('with bad code', 'test-nomen.js').fail();
    lint('with directives', 'test-nomen.js', {
        nomen: true,
        errorsOnly: true
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

    test('stream support', function (t) {
        t.plan(1);

        var str = jslint();

        str.on('error', function () {
            t.ok(true, 'errored out on stream');
        });

        str.write({
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

    test('custom reporter via string', function (t) {
        t.plan(3);

        var str = jslint({
            reporter: path.resolve(__dirname, './test-reporter.js')
        });

        str.on('data', function () {
            t.ok(global.GULP_JSLINT_REPORTER, 'reporter fired');
            t.ok(global.GULP_JSLINT_REPORTER.hasOwnProperty('pass'), 'lint status is in event data');
            t.ok(global.GULP_JSLINT_REPORTER.hasOwnProperty('file'), 'source file is in event data');
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
        t.plan(3);

        var str = jslint({
            reporter: function (evt) {
                t.ok(true, 'reporter fired');
                t.ok(evt.hasOwnProperty('pass'), 'lint status is in event data');
                t.ok(evt.hasOwnProperty('file'), 'source file is in event data');
            }
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

    test('custom bad reporter (object)', function (t) {
        t.plan(4);

        var str = jslint({
            reporter: {
                what: 'this object should be ignored'
            }
        });

        str.on('error', function (err) {
            var message = strip(String(err));
            t.ok(message.indexOf('Error') > -1, 'valid error');
            t.ok(message.indexOf('gulp-jslint') > -1, 'valid source');
            t.ok(message.indexOf('failed to lint') > -1, 'valid description');
            t.ok(message.indexOf(path.join('test', 'test-nomen.js')) > -1, 'valid filename');
        });

        fs.readFile(path.resolve(__dirname, './test-nomen.js'), function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                str.write(new Vinyl({
                    base: __dirname,
                    cwd: path.resolve(__dirname, '../'),
                    path: path.join(__dirname, 'test-nomen.js'),
                    contents: data
                }));
            }
        });
    });

    test('custom bad reporter (missing module)', function (t) {
        t.plan(1);

        var str = jslint({
            reporter: 'some-random-ass-reporter'
        });

        str.on('error', function () {
            t.ok(true, 'errored out');
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
}());
