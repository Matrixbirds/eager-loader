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
