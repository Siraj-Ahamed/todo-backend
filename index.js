const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

app.use(express.json());

app.use(cors());

dotenv.config();
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Sample in-memory  storage
// let todos = [];

// Connecting mongodb
mongoose
    .connect(process.env.MONGO_ATLAS)
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.log("ERROR: ", err);
    });

// Creating Schema
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
});

// Creating Model
const todoModel = mongoose.model("Todo", todoSchema);

app.post("/todos", async (req, res) => {
    const { title, description } = req.body;

    try {
        const newTodo = new todoModel({ title, description });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

app.get("/todos", async (req, res) => {
    try {
        const todos = await todoModel.find({});
        res.status(200).json(todos);
    } catch (error) {
        console.log(error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});

// Update a todo item
app.put("/todos/:id", async (req, res) => {
    try {
        const { title, description } = req.body;
        const id = req.params.id;
        const updateTodo = await todoModel.findByIdAndUpdate(
            id,
            { title, description },
            { new: true }
        );
        if (!updateTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json(updateTodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await todoModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
