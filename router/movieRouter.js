const router = require("express").Router();
const { movieController } = require("../controller");
const { readToken } = require("../config");

router.get("/get/all", movieController.getAllMovie);
router.get("/get", movieController.getCategory);
router.post("/add", readToken, movieController.addMovie);
router.patch("/edit/:id", readToken, movieController.edit);
router.patch("/set/:id", readToken, movieController.set);

module.exports = router;
