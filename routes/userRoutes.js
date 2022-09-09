const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJwt");

router.use(verifyJWT);

router
	.route("/")
	.get(userControllers.getAllUsers)
	.post(userControllers.createNewUser)
	.patch(userControllers.updateUser)
	.delete(userControllers.deleteUser);

module.exports = router;
