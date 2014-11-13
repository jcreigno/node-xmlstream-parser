/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/
"use strict";

var expat = require('node-expat'),
    Transform = require('stream').Transform,
    util = require('util');

function _parser(path, readable) {
    var saxStream = new expat.Parser('UTF-8');
    var current = {},
        stack = [current],
        elementText = false;

    function parent() {
        return stack.slice(-1)[0];
    }

    function appendChild(name, obj) {
        var p = parent()[name];
        if (p) {
            if (Array.isArray(p)) {
                p.push(obj);
            } else {
                parent()[name] = [p, obj];
            }
        } else {
            parent()[name] = obj;
        }
    }

    function startElement(name, attrs) {
        current = {};
        if (attrs) {
            Object.keys(attrs).forEach(function (att) {
                current['$' + att] = attrs[att];
            });
        }
        stack.push(current);
        elementText = true;
    }

    function endElement(name) {
        current = stack.pop();
        if (elementText && 'string' === typeof elementText) {
            if (Object.keys(current) != 0) {
                current._ = elementText;
            } else {
                current = elementText;
            }
        }
        appendChild(name, current);
        elementText = false;
        if (name == path) {
            readable.push(current);
        }
    }

    function chars(text) {
        if (elementText) {
            elementText = text;
        }
    }

    saxStream
        .on('startElement', startElement)
        .on('endElement', endElement)
        .on('text', chars)
        .on('end', function () {
            if (path == '/') {
                readable.push(current);
            }
        }).on('error', function (e) {
            readable.emit('error', new Error(saxStream.getError()));
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
