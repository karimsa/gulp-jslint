/**
 * lib/reporter.js - gulp-jslint
 * Copyright (C) 2014-2016 Karim Alibhai.
 */

'use strict';

const map = require('map-stream'),
      Stream = require('stream').Stream,
      supported = {
          'default': require('./reporters/default.js'),
          stylish: require('./reporters/stylish.js')
      },
      fixIndex = function (jslint) {
          // it seems that JSLint is a bit inconsistent about
          // how it reports column numbers and messages. this
          // forces standardization between the reporters
          jslint.errors = jslint.errors
                .filter(err => err)
                .map((i) => {
                    i.column = i.column || i.character;
                    i.message = i.message || i.reason;
                    return i;
                })
                .sort((a, b) => a.column - b.column)
                .sort((a, b) => a.line - b.line);

          return jslint;
      };

module.exports = function (name, options) {
    options = typeof options !== 'undefined' ? options : {};
    let reporter = name || 'default';

    // if the report is a function, then it does not need any options
    if (typeof reporter !== 'function') {
        // if the given reporter is bundled with gulp-jslint,
        // load it. otherwise, try to 'require' the given reporter.
        let createReporter = supported.hasOwnProperty(name) ? supported[name] : require(name);

        // create a reporter with the given options object
        reporter = createReporter(options);
    }

    // print newline to seperate reporter output from gulp output
    process.stdout.write('\n');

    // if the reporter is not a stream, wrap it with a map-stream
    if (!(reporter instanceof Stream)) {
        let stream = map((source, next) => next(null, reporter(fixIndex(source.jslint) || source)));
        stream.on('end', () => console.log());
        return stream;
    }

    // add ending newline on finish
    reporter.on('end', () => console.log());

    // for stream reporters, just return
    return reporter;
};