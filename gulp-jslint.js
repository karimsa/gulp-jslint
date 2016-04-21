/**
 * gulp-jslint.js
 * Copyright (C) 2014-2016 Karim Alibhai.
 */

'use strict';

const LintStream = require('jslint').LintStream,
      map = require('map-stream'),
      path = require('path'),
      rc = require('rc');

/**
 * The outer linting function that creates an output
 * object.
 * 
 * @param options a JSON object containing defined options
 */
module.exports = function (options) {
    // fallback to empty object
    options = options || {};

    // extend .jslintrc; give options
    // the priority for directives
    options = rc('jslint', options);

    // force boolean and remove from options
    const errorsOnly = options.hasOwnProperty('errorsOnly') && options.errorsOnly === true;
    delete options.errorsOnly;

    // use 'global' for consistency prefer 'predef' because of JSLint
    options.predef = options.predef || options.global || {};
    
    // freeze to user's prefered edition or use latest
    options.edition = options.edition || 'latest';

    // create a new lint stream 
    const lintStream = new LintStream(options);

    // map the incoming vinyl object to the object
    // expected by the lint stream 
    const stream = map((data, next) => {
        const source = data.source;
        
        // only continue with file inputs
        if (source.isNull()) return next(null, source);
        if (source.isStream()) return next(new gutil.PluginError('gulp-jslint', 'Not sure how to handle stream as input file.'));
        next(null, {
            file: data,
            body: source.contents.toString('utf8')
        });
    });
    
    // begin linting
    stream.pipe(lintStream)

        // map the lint stream results object back to the
        // vinyl object expected by the reporter and rest
        // of the gulp stream
        .pipe(map((data, next) => {
            const source = data.file.source;
            if (source.isNull()) return next(null, source);

            // map over the properties required by a lint reporter
            source.jslint = {};
            source.jslint.success = data.linted.ok;
            source.jslint.errors = data.linted.errors;
            source.jslint.warnings = data.linted.warnings;

            // continue the stream process
            next(null, source);
            data.file.done();
        }));

    // create a gulp-able stream that allows for chunked linting
    return map((source, next) => {
        stream.write({
            source: source,
            done: () => next(null, source)
        });
    });
};