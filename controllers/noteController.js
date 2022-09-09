const Note = require("../models/Note");
const User = require("../models/User");
const express = require("express");
const asyncHandler = require("express-async-handler");
const ObjectId = require("mongoose").Types.ObjectId;

const getAllNotes = asyncHandler(async (req, res) => {
	const notes = await Note.find().lean();

	if (!notes?.length)
		return res.status(400).json({ message: "No notes found!" });

	// Add username to each note before sending the response
	const noteWithUser = await Promise.all(
		notes.map(async (note) => {
			const user = await User.findById(note?.user).lean().exec();

			return { ...note, username: user?.username };
		})
	);

	res.json(noteWithUser);
});

const createNewNote = asyncHandler(async (req, res) => {
	const { title, text, user } = req.body;

	if (!title || !text || !user)
		return res.status(400).json({ message: "All fields are required!" });

	// check duplicate
	const duplicate = await Note.findOne({ title })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();
	if (duplicate)
		return res.status(400).json({ message: "Duplicate note title!" });

	// create new note
	const noteObject = { user, title, text };

	const note = await Note.create(noteObject);

	if (!note)
		return res.status(400).json({ message: "Invalid data recieved!" });

	res.status(201).json({
		message: `New note is created!`,
	});
});

const updateNote = asyncHandler(async (req, res) => {
	const { id, title, text, completed } = req.body;

	if (!id || !title || !text || typeof completed !== "boolean") {
		return res.status(400).json({ message: "All fields are required!" });
	}

	// check duplicate
	const duplicate = await Note.findOne({ title })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();

	if (duplicate && duplicate?._id.toString() !== id)
		return res.status(400).json({ message: "Duplicate note title!" });

	// find note
	const note = await Note.findById(id).exec();

	if (!note) return res.status(400).json({ message: "Note not found!" });

	// update note
	note.title = title;
	note.text = text;
	note.completed = completed;

	const result = await note.save();

	res.json({ message: `Note ${result.title} is updated!` });
});

const deleteNote = asyncHandler(async (req, res) => {
	const { id } = req.body;

	if (!id) return res.status.json({ message: "Note ID is required!" });

	// find note with id
	const note = await Note.findById(id).exec();

	if (!note) return res.status(400).json({ message: "Note not found!" });

	// delete note
	const result = await note.deleteOne();

	res.json({ message: `Note ${result.title} is deleted!` });
});

module.exports = {
	getAllNotes,
	createNewNote,
	updateNote,
	deleteNote,
};
