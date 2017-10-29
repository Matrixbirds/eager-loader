import test from "ava"
import models from "./models"

test ("lib", t => {
    t.truthy(models.AModel)
    t.truthy(models.IndexModel)
})
