import express from "express";
import db from "./db/conn.mjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Photo from "./models/photo.js";

import * as fs from "fs";
import readline from "readline";
import { parseFile } from "@fast-csv/parse";
import { parse } from "path";


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

    let puzzle = {};

    const readable = fs.createReadStream("../irris_guessing_game_answers_shuffled.csv", "utf-8");

    const lineReader = readline.createInterface(readable);
    let firstLine = true;

    lineReader.on("line", (line) => {
        if (firstLine) {
            firstLine = false;
            return;
        }

        if (line[0] == 0){
            lineReader.close();
            lineReader.removeAllListeners();
        }

        const row = line.split(",");

        puzzle.Days_since_launch = row[0];
        puzzle.answer = {};
        puzzle.answer.names = [row[1].toLowerCase(), row[2].toLowerCase(), row[3].toLowerCase(), row[4].toLowerCase(), row[5].toLowerCase()];

        const pictures = [];
        const names = puzzle.answer.names;
        puzzle.answer.pictures = [];

        
        const member1 = Photo.aggregate().match({member: names[0]}).sample(1);
        const member2 = Photo.aggregate().match({member: names[1]}).sample(1);
        const member3 = Photo.aggregate().match({member: names[2]}).sample(1);
        const member4 = Photo.aggregate().match({member: names[3]}).sample(1);
        const member5 = Photo.aggregate().match({member: names[4]}).sample(1);


        Promise.all([member1, member2, member3, member4, member5])
            .then((values) => {
                for(let i = 0; i < values.length; i ++){
                    const photo = values[i][0];

                    if(photo.cropped.length == 1){
                        pictures.push(photo.cropped[0]);
                    }else {
                        const randInd = Math.round(Math.random() * (photo.cropped.length - 1))
                        pictures.push(photo.cropped[randInd]);
                    }

                   
                }
                puzzle.answer.pictures = pictures;
                console.log(puzzle);
            })

            

        // for (let i = 0; i < names.length; i ++){
        //     const query = {member: names[i]}
        //     Photo.aggregate().match(query).sample(1)
        //         .then((data) => {
        //             const photo = data[0];
        //             const randInd = Math.round(Math.random() * photo.cropped.length);
        //             pictures.push(`Photo of ${names[i]} ${photo.cropped[randInd]}`);
        //             console.log(pictures);
        //         })

        //     // const photo = result[0];
        //     // const randInd = Math.round(Math.random() * photo.cropped.length)
            
        //     // pictures.push(photo.cropped[randInd]);
        // }

        // console.log(puzzle);
    })

    // parseFile("../irris_guessing_game_answers_shuffled.csv", {maxRows: 5, skipRows: 1})
    //     .on("error", error => console.log(error))
    //     .on("data", (row) => {

    //         puzzle.Days_since_launch = row[0];

    //         puzzle.answer = {};
    //         puzzle.answer.names = [row[1].toLowerCase(), row[2].toLowerCase(), row[3].toLowerCase(), row[4].toLowerCase(), row[5].toLowerCase()];

    //         //Get model for Photos and query it for a random photo based on the name

    //         const names = puzzle.answer.names
    //         const pictures = [];

    //         for (let i = 0; i < names.length; i ++){
    //             console.log(names.length)
    //             const query = {member: names[i]}
    //             Photo.aggregate().match(query).sample(1)
    //                 .then((data) => {
    //                     const photo = data[0]
    //                     console.log(photo)
    //                     console.log(photo.member + " index " + i)
    //                     console.log(photo.cropped)
    //                 })

    //             // const photo = result[0];
    //             // const randInd = Math.round(Math.random() * photo.cropped.length)
                
    //             // pictures.push(photo.cropped[randInd]);
                
    //         }

    //     })
    //     .on("end", rowCount => console.log(`Parsed ${rowCount} rows`))
    
})

app.listen(PORT, () => {
    console.log(`Server listening at PORT ${PORT}...`)
})