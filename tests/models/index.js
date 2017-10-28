"use strict"
const path = require("path")
const D = {}
const R = {}
const loadModule = require("../../lib")
module.exports = loadModule({
    deps: [{D, R}],
    format: ".model.js"
})
