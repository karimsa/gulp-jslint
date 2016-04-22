/**
 * lib/reporters/default.js - gulp-jslint
 * Copyright (C) 2014-2016 Karim Alibhai.
 */

'use strict';

const chalk = require('chalk'),
      util = require('util'),
      path = require('path');

module.exports = function ( errorsOnly ) {
    // explicitly convert boolean
    errorsOnly = errorsOnly === true;

    const error = function () {
        console.log(chalk.red(' ✖ ' + util.format.apply(util, arguments)));
    }, subError = function () {
        console.log(chalk.red('   ✖ ' + util.format.apply(util, arguments)));
    }, ok = function () {
        if (!errorsOnly) console.log(chalk.green(' ✓ ' + util.format.apply(util, arguments)));
    };

    return function ( results ) {
        // print the filename and status of the linting
        if (results.success) ok(path.basename(results.filename));
        else error(path.basename(results.filename));

        // sort by column, then by line, then print
        results.errors
            .sort((a, b) => a.column - b.column)
            .sort((a, b) => a.line - b.line)
            .forEach((res) => subError('%s:%s: %s', res.line, res.column, res.message));
    };
};