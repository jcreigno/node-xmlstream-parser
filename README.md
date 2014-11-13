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

### Parsing rules

* node attributes are parsed and prefixed with `$`
```xml
<message value="hello"/>
```
is parsed as : 
```js
{
    message: {
        $value : 'hello'
    }
}
```

* if a node element as only one child text node then it is parsed as simple value
```xml
<message>hello</message>
```
is parsed as : 
```js
{
    message: 'hello'
}
```
* if a node as more than one child with the same name then it is parsed as an Array
```xml
<message>hello</message>
<message>world</message>
```
is parsed as : 
```js
{
    message: ['hello', 'world']
}
```

* if a node as more than one child with with a text node, then it is parsed as `_`
```xml
<message priority="important">hello</message>
```
is parsed as : 
```js
{
    message: {
        _ : 'hello', 
        $priority : 'important'
    }
}
```