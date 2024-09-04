import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    member: {
        type: String,
        required: true
    },
    cropped: {
        type: [{
            type: Map,
            of: String
        }],
        required: true
    },
    full_photo: {
        type: String,
        required: true
    }
});

export default mongoose.model("Photo", photoSchema);