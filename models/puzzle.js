import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema({
    answer: {
        type: Map,
        of: [{type: String}],
        required: true
    },
    date: {type: Date, required: true},
    Days_since_launch: {type: Number, required: true}
}, {collection: "puzzles"});

export default mongoose.model("Puzzle", puzzleSchema);