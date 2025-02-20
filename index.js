import express from "express";
import db from "./db/conn.mjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import Photo from "./models/photo.js";
import Puzzle from "./models/puzzle.js";


import * as fs from "fs";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to IRRIS Guessing Game API");
})

app.get("/v1/puzzle/:date", async (req, res) => {
    const dateQuery = new Date(req.params.date);
    const query = {date: dateQuery};

    const result = await Puzzle.findOne(query);

    if (!result) res.status(404).send("Resource Not Found");
    else res.status(200).send(result);

    
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

    const readable = fs.createReadStream("./irris_guessing_game_answers_shuffled.csv", "utf-8");


    readable.on("data", (chunk) => {
        const lines = chunk.split("\n");
        const index = Array.from({length: 5}, (_, index) => index + 1);

        
        const results = index.map(i => lines[i]);


        for (let i = 0; i < results.length; i ++) {
            let pictures = [];


            const result = results[i].split(",").map(n => n.toLowerCase());
            const names = [result[1], result[2], result[3], result[4], result[5]];

            async function fillArr (names, arr = []) {
                let ids = [];
                let keepGoing = true;

                for (let i = 0; i < names.length; i ++) {
                    const l = await Photo.aggregate().match({member: names[0]}).sample(1);
            
                    while (keepGoing) {
                        const r = await Photo.aggregate().match({member: names[i]}).sample(1);
                        
                        if (!ids.includes(r[0]._id)) {
                            keepGoing = false;
                            arr.push(r[0]);
                            ids.push(r[0]._id);
                        }

                    }

                    keepGoing = true;
                }

                return arr;
            }


            fillArr(names).then(async (values) => {
                for (let i = 0; i < values.length; i ++) {
                    const photo = values[i];

                    if(photo.cropped.length == 1){
                        pictures.push(photo.cropped[0]);
                    }else {
                        let randInd = Math.round(Math.random() * (photo.cropped.length - 1));

                        pictures.push(photo.cropped[randInd]);
                    }
                }

                let currDate = new Date();
                if (result[0] == 0) {
                    puzzle.date = currDate.toISOString().split('T')[0];
                }else {
                    currDate = new Date(currDate.setDate(currDate.getDate() + Number(result[0])));
                    puzzle.date = currDate.toISOString().split('T')[0];
                }

                puzzle.Days_since_launch = result[0];
                puzzle.answer.names = names;
                puzzle.answer.pictures = pictures;

                //Add new puzzles to collection
                await Puzzle.create(puzzle);
                return;

            })
        }

        readable.destroy();
    })

    res.send("Seeding Complete!");
    
})

app.listen(PORT, () => {
    console.log(`Server listening at PORT ${PORT}...`)
})