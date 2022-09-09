const express = require("express");
const router = express.Router();
const noteControllers = require("../controllers/noteController");
const verifyJWT = require("../middlewares/verifyJwt");

router.use(verifyJWT);

router
	.route("/")
	.get(noteControllers.getAllNotes)
	.post(noteControllers.createNewNote)
	.patch(noteControllers.updateNote)
	.delete(noteControllers.deleteNote);

module.exports = router;
