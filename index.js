import express from "express";
import db from "./db/conn.mjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Photo from "./models/photo.js";
import Puzzle from "./models/puzzle.js";

import * as fs from "fs";


dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Welcome to IRRIS Guessing Game API");
})

app.get("/seed", (req, res) => {
    //Import the csv file
    //For each row in the csv file pull data from the db
    //Add each object to the database

    //Delete everything in puzzle collection
    (async () => {
        await Puzzle.deleteMany();
    })();
    

    let puzzle = {};
    puzzle.answer = {};

    const readable = fs.createReadStream("../irris_guessing_game_answers_shuffled.csv", "utf-8");


    readable.on("data", (chunk) => {
        const lines = chunk.split("\n");
        const index = Array.from({length: 6}, (_, index) => index + 1);
        const results = index.map(i => lines[i]);
        

        for (let i = 0; i < results.length; i ++) {


            let pictures = [];

            const result = results[i].split(",").map(n => n.toLowerCase());

            const names = [result[1], result[2], result[3], result[4], result[5]];

            const member1 = Photo.aggregate().match({member: names[0]}).sample(1);
            const member2 = Photo.aggregate().match({member: names[1]}).sample(1);
            const member3 = Photo.aggregate().match({member: names[2]}).sample(1);
            const member4 = Photo.aggregate().match({member: names[3]}).sample(1);
            const member5 = Photo.aggregate().match({member: names[4]}).sample(1);

            Promise.all([member1, member2, member3, member4, member5])
                .then(async (values) => {
                    for(let i = 0; i < values.length; i ++){
                        const photo = values[i][0];

                        if(photo.cropped.length == 1){
                            pictures.push(photo.cropped[0]);
                        }else {
                            const randInd = Math.round(Math.random() * (photo.cropped.length - 1))
                            pictures.push(photo.cropped[randInd]);
                        }                    
                    }

                    let currDate = new Date();
                    if (result[0] == 0) {
                        puzzle.date = currDate;
                    }else {
                        puzzle.date = new Date(currDate.setDate(currDate.getDate() + Number(result[0])));
                    }

                    puzzle.Days_since_launch = result[0];
                    puzzle.answer.names = names;
                    puzzle.answer.pictures = pictures;

                    //Add new puzzles to collection
                    await Puzzle.create(puzzle);

                    console.log(puzzle);
                    return;
                    
                })


            }

            readable.destroy();

        
    })
    
})

app.listen(PORT, () => {
    console.log(`Server listening at PORT ${PORT}...`)
})