import mongoose from "mongoose";
import dotenv from "dotenv"

const dbName = "guessing_game_photos";

dotenv.config();

const db = mongoose.connect(process.env.ATLAS_URI, {
    dbName: "guessing_game_photos"
    }).then(()=> {
        console.log("Connected to database");
    }).catch((err) => {
        console.log("Not connected to the database. ", err);
    })

export default db

