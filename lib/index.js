/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/
"use strict";

var sax = require('sax'),
    Transform = require('stream').Transform,
    util = require('util');

function _parser(path, readable) {
    var saxStream = sax.createStream(true);
    var current = {},
        stack = [current],
        elementText = false;

    function parent() {
        return stack.slice(-1)[0];
    }

    saxStream.on('opentag', function (tag) {
        current = {};
        if (tag.attributes) {
            Object.keys(tag.attributes).forEach(function (att) {
                current['$' + att] = tag.attributes[att];
            });
        }
        var p = parent()[tag.name];
        if (p) {
            if (Array.isArray(p)) {
                p.push(current);
            } else {
                parent()[tag.name] = [p];
            }
        } else {
            parent()[tag.name] = current;
        }
        stack.push(current);
        elementText = true;
    }).on('closetag', function (name) {
        current = stack.pop();
        if (elementText && 'string' === typeof elementText) {
            if (Object.keys(current) == 0) {
                parent()[name] = elementText;
            } else {
                current.$text = elementText;
            }
        }
        elementText = false;
        if (name == path) {
            readable.push(current);
        }
    }).on("text", function (text) {
        if (elementText) {
            elementText = text;
        }
    }).on('end', function () {
        if (path == '/') {
            readable.push(current);
        }
    });
    return saxStream;
}

function XMLParseStream(options) {
    if (!(this instanceof XMLParseStream)) {
        return new XMLParseStream(options);
    }

    Transform.call(this, options);
    this._writableState.objectMode = false;
    this._readableState.objectMode = true;
    this._parser = _parser(options, this);
}

util.inherits(XMLParseStream, Transform);

XMLParseStream.prototype._transform = function (chunk, encoding, cb) {
    this._parser.write(chunk);
    cb();
};

XMLParseStream.prototype._flush = function (cb) {
    this._parser.end();
    cb();
};

module.exports = {
    parse: function (opts) {
        return new XMLParseStream(opts);
    }
};
