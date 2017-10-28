"use strict"
const R = require("ramda")
const fs = require("fs")
const path = require("path")

function camelCase (str) {
    const words = string => string.match(/\w+/g) || []
    return words(str).reduce((result, word, index) => {
        word = word[0].toUpperCase() + word.slice(1).toLowerCase()
        return result + word
    }, "")
}

const fileFormat =
    format =>
        file =>
            (file.indexOf(".") !== 0) && (file.slice(-format.length) === format)

const jsFile = /^(?!\\.).+js$/

function readdirSync (path) {
    return R.filter(file => {
        return (file !== "index.js") && (file.match(jsFile))
    })(fs.readdirSync(path))
}

function importSubModule ({dir, format, deps}) {
    return R.pipe(
        R.filter(fileFormat(format)),
        R.reduce((res, file) => {
            const _module = require(path.join(dir, file))
            const name = camelCase(path.basename(file).split(".js")[0])
            res[name] = _module(...deps)
            return res
        }, {})
    )(readdirSync(dir))
}

function Module ({dir, format, deps}) {
    const __dict__ = Object.seal({
        "deps": deps || [],
        "format": format || ".js",
        "dir": module.parent.filename.replace(/\/[^/]*.js$/, "")
    })

    const addProperty = property => {
        Object.defineProperty(this, property, {
            enumerable: false,
            get: () => __dict__[property],
            set: args => { Object.assign(__dict__, { [`${property}`]: args }) }
        })
    }
    R.forEach(addProperty, ["format", "dir"])

    Object.defineProperty(this, "deps", {
        enumerable: false,
        get: () => (__dict__["deps"]),
        set: args => {
            if (!Array.isArray(args)) throw Error("argument must be present array")
            __dict__["deps"] = args
        }
    })

    Object.defineProperty(this, "__meta__", {
        enumerable: false,
        get: () => (importSubModule(__dict__))
    })
}

function load ({deps, format}) {
    const { __meta__ } = new Module({
        format: format || ".js",
        deps
    })
    return __meta__
}

module.exports = load
