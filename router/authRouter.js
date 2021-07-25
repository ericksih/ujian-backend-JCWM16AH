const router = require("express").Router();
const { authController } = require("../controller");
const { readToken } = require("../config");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.patch("/deactive", readToken, authController.deactivate);
router.patch("/activate", readToken, authController.activate);
router.patch("/close", readToken, authController.close);

module.exports = router;
