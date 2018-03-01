const fs = require('fs')
const parse = require('csv-parse')
const async = require('async')
const _ = require('lodash')
require('require-csv')
const plans = require('./csv_files/plans.csv')
const zips = require('./csv_files/zips.csv')
const slcspZips = require('./csv_files/slcsp.csv')
const stateCodes = require('./states').states

let statePlans
let allZips
let slcsp

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

const buildZips = () => {
    const headers = zips[0]
    zips.splice(0, 1) // remove the header line
    return zips.map(row => {
        return _.zipObject(headers, row)
    })
}

const buildSLCSP = () => {
    const headers = slcspZips[0]
    slcspZips.splice(0, 1) // remove the header line
    return slcspZips.map(row => {
        return _.zipObject(headers, row)
    })
}

const findSlcspByZip = zipRate => {
    let findZips = allZips.filter(zip => zip.zipcode == zipRate.zipcode)
    if (findZips.length === 1) {
        let foundZip = findZips[0]
        if (statePlans[foundZip.state][foundZip.rate_area]) {
            let sortedPlans = _.chain(statePlans[foundZip.state][foundZip.rate_area].Silver)
                .sortBy('rate')
                .uniqBy('rate')
                .value()
            return sortedPlans[1].rate
        }
    } else {
        let initialRateArea = findZips[0].rate_area
        if (findZips.filter(zip => zip.rate_area === initialRateArea).length === findZips.length) {
            let sortedPlans = _.chain(statePlans[findZips[0].state][initialRateArea].Silver)
                .sortBy('rate')
                .uniqBy('rate')
                .value()
            return sortedPlans[1].rate
        }
    }
}

const processSlcspCsv = () => {
    //initialize the data
    statePlans = buildStatePlans()
    allZips = buildZips()
    slcsp = buildSLCSP()
    let newDoc = []
    slcsp.forEach(zipRate => {
        newDoc.push({ zipcode: zipRate.zipcode, rate: findSlcspByZip(zipRate) })
    })
    console.log(newDoc)
}

processSlcspCsv()
