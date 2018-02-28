const fs = require('fs')
const parse = require('csv-parse')
const async = require('async')
const _ = require('lodash')
require('require-csv')
const plans = require('./csv_files/plans.csv')
const stateCodes = require('./states').states

const findSLCSPByZip = function() {
    let statePlans = buildStatePlans()
    let all
}

const buildStatePlans = () => {
    const headers = plans[0]
    plans.splice(0, 1) // remove the header line
    let states = {}
    stateCodes.forEach(code => {
        states[code] = {}
    })
    plans.forEach(row => {
        var item = _.zipObject(headers, row)
        let stateRateArea = states[item.state][item.rate_area]
        if (stateRateArea) {
            stateRateArea[item.metal_level].push({ rate: item.rate, planId: item.plan_id })
        } else {
            states[item.state][item.rate_area] = {
                Bronze: [],
                Silver: [],
                Gold: [],
                Platinum: [],
                Catastrophic: []
            }
            states[item.state][item.rate_area][item.metal_level].push({ rate: item.rate, planId: item.plan_id })
        }
    })
    return states
}

const buildZips = () => {}

findSLCSPByZip()
