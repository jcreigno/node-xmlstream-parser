node-xmlstream-parser
=====================

simple xml stream parser based on sax.
Takes a readable xml stream as input and emits parsed object as result.

This module is inspired by [JSONStream.parse](https://github.com/dominictarr/JSONStream#jsonstreamparsepath).

### Installation

`npm install --save xmlstream-parser`


### Usage

```js

var streamParser = require('../lib/index'),
    JSONStream = require('JSONStream'),
    fs = require('fs');

fs.createReadStream('response.xml')
    .pipe(streamParser.parse('Item')) // emit Items elements
    .pipe(JSONStream.stringify()) // stringify objects
    .pipe(process.stdout);
```

