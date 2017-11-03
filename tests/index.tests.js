import test from "ava"
import models from "./models"

test ("lib", t => {
    t.truthy(models.AModel)
    t.truthy(models.IndexModel)
})

test ("subdir", t => {
    t.falsy(models.Subdir.AT)
    t.truthy(models.Subdir.AModel)
})

test ("subdir nested object", t => {
    t.truthy(models.Subdir.BModel)
    t.deepEqual(models.Subdir.BModel, {name: "1024", tag: "1024"})
})

