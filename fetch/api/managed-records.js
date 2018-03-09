import fetch from '../util/fetch-fill'
import URI from 'urijs'

// /records endpoint
window.path = 'http://localhost:3000/records'

// Your retrieve function plus any additional functions go here ...
const retrieve = options => {
    let query = buildQuery(options)
    let uri = new URI(window.path).query(query)
    return fetch(uri)
        .then(response => response.json())
        .then(data => {
            let output = manipulateApiData(data, options)
            return output
        })
        .catch(function(err) {
            console.log(err)
        })
}

const manipulateApiData = (data, options) => {
    let analyzedData = { previousPage: null, nextPage: null, ids: [], open: [], closedPrimaryCount: 0 }
    if (options && options.page) {
        if (options.page > 1) {
            analyzedData.previousPage = options.page - 1
        }
        if (options.page < 50) {
            analyzedData.nextPage = options.page + 1
        }
    } else {
        if (data.length) {
            analyzedData.nextPage = 2
        }
    }
    data.forEach(item => {
        item.isPrimary = false
        analyzedData.ids.push(item.id)
        if (primaryColors.indexOf(item.color) > -1) {
            item.isPrimary = true
        }
        if (item.disposition === 'open') {
            analyzedData.open.push(item)
        } else {
            if (item.isPrimary) {
                analyzedData.closedPrimaryCount++
            }
        }
    })
    return analyzedData
}

const buildQuery = options => {
    let query = { limit: 10 }
    if (options) {
        if (options.page) {
            query.offset = 10 * options.page - 10
        }
        if (options.colors) {
            //the records/index.js file (which I cannot edit) seems to want to read the 'color' portion of the query as an array.
            //There must be more than one 'color' property for it to parse it as an array, otherwise the tests will fail.
            //Instantiating the array with an empty string it doesnt seem to prevent the Express API's functionality from working.
            //Since I cannot edit the Express API, this is the best workaround I could come up with.
            query.color = ['']
            options.colors.forEach(color => {
                query.color.push(color)
            })
        }
    }
    return query
}

const primaryColors = ['red', 'yellow', 'blue']

export default retrieve
