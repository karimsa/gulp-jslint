/**
 * lib/reporter.js - gulp-jslint
 * Copyright (C) 2014-2016 Karim Alibhai.
 */

'use strict';

const map = require('map-stream'),
      Stream = require('stream').Stream,
      supported = {
          'default': require('./reporters/default.js')
      };

module.exports = function (name, options) {
    options = typeof options === 'object' ? options : {};

    // if the given reporter is bundled with gulp-jslint,
    // load it. otherwise, try to 'require' the given reporter.
    const createReporter = supported.hasOwnProperty(name) ? supported[name] : require(name);

    // create a reporter with the given options object
    const reporter = createReporter(options);
    
    // print newline to seperate reporter output from gulp output
    process.stdout.write('\n');

    // if the reporter is not a stream, wrap it with a map-stream
    if (!(reporter instanceof Stream)) {
        let stream = map((source, next) => next(null, reporter(source.jslint)));
        stream.on('end', () => console.log());
        return stream;
    }

    // add ending newline on finish
    reporter.on('end', () => console.log());

    // for stream reporters, just return
    return reporter;
};