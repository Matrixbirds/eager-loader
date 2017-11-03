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
        file => {
            return fs.lstatSync(file).isDirectory() || (file.indexOf(".") !== 0) && (file.slice(-format.length) === format)
        }

const jsFile = /^(?!\\.).+js$/

function readdirSync (dir) {
    return R.pipe(
        R.filter(file => {
            return fs.lstatSync(path.join(dir, file)).isDirectory()
                || (file !== "index.js") && (file.match(jsFile))
        }),
        R.map(file => {
            return path.join(dir, file)
        })
    )(fs.readdirSync(dir))
}

function deepClone (dst, src) {
    for (let key in src) {
        if (src[key] && typeof src[key] === "object") {
            dst[key] = Array.isArray(src[key]) ? [] : {}
            deepClone(dst[key], src[key])
        }
        else {
            dst[key] = src[key]
        }
    }
    return dst
}

function importSubModule ({dir, format, deps}, obj) {
    const res = readdirSync(dir)
    return R.pipe(
        R.filter(fileFormat(format)),
        R.reduce((res, file) => {
            const name = camelCase(path.basename(file).split(".js")[0])
            if (fs.lstatSync(file).isDirectory()) {
                res[name] = {}
                deepClone(res[name], importSubModule({dir: file,
                    format,
                    deps
                }, {}))
            }
            else {
                const _module = require(file)
                if (!_module || typeof _module !== "function") {
                    console.log('errr')
                    throw Error(`${file} should module.exports a function`)
                }
                const _deps = _module(...deps)
                if (typeof _deps === "object") {
                    res[name] = Array.isArray(_deps) ? [] : {}
                    deepClone(res[name], _deps)
                }
                else {
                    res[name] = _deps
                }
            }
            return res
        }, obj)
    )(res)
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

    const objects = {}

    Object.defineProperty(this, "__meta__", {
        enumerable: false,
        get: () => (importSubModule(__dict__, objects))
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
