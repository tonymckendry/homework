var fs = require('fs')
var parse = require('csv-parse')
var async = require('async')
var _ = require('lodash')
require('require-csv')
let theCSV = require('./csv_files/plans.csv')

// var test = function() {
//     var inputFile = './csv_files/plans.csv'

//     var parser = parse({ delimiter: ',' }, function(err, data) {
//         let headers = data[0]
//     })
//     fs.createReadStream(inputFile).pipe(parser)
// }
var test = function() {
    var headers = theCSV[0]
    theCSV.splice(0, 1) // remove the header line
    populatedObject = {}
    theCSV.forEach(function(item) {
        var obj = _.zipObject(headers, item)
        populatedObject[obj.plan_id] = obj //not sure what key we will need but this is how
    })
    console.log(populatedObject)
}

test()
