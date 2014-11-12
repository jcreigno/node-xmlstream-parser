/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/

"use strict";

var streamParser = require('../lib/index'),
    JSONStream = require('JSONStream'),
    fs = require('fs');


fs.createReadStream(__dirname + '/response-big.xml')
    .pipe(streamParser.parse('Item'))
    .pipe(JSONStream.stringify())
    .pipe(process.stdout);
