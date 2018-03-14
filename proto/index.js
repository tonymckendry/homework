var Parser = require('binary-parser').Parser

var ipHeader = new Parser()
    .endianess('big')
    .bit4('MPS7')
    .bit1('version')
    .uint32('records')

// Prepare buffer to parse.
var buf = Buffer.from('./txnlog.dat')

// Parse buffer and show result
console.log(ipHeader.parse(buf))
