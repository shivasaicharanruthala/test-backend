import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv';
import fileUpload from 'express-fileupload';

import routes from './routes/index.js';           // imports routes
import connectMongo from "./database/index.js";
import fs from "fs";
import {google} from "googleapis";  //  imports function to connect mongo DB.

dotenv.config() // setup .env config

const app = express();

// Adds all required middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());

// Register all routes.
routes(app);
const OAuth2 = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

// connect to mongoDB.
connectMongo().then(() => {
    console.log("Connected to MongoDB!!!");
}).catch(err => {
    console.error("Error connecting to MongoDB: ", err);
    process.exit(0);
})

try {
    const creds = fs.readFileSync("creds.json");

    OAuth2.setCredentials(JSON.parse(creds))
} catch (err) {
    console.log("No Creds found")
}

app.get("/health", (req, res) => {
    res.status(200).send("{'health': 'ok'}")
})
app.get("/auth/google", (req, res) => {
    const url = OAuth2.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.appdata",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events"
        ],
    })
    console.log("test url: ", url)
    res.redirect(url)
})

app.get("/google/redirect", async (req, res) => {
    const { code } = req.query
    const { tokens } = await OAuth2.getToken(code);
    OAuth2.setCredentials(tokens)
    fs.writeFileSync("creds.json", JSON.stringify(tokens))
    res.send({"msg": "Login successful"})
})

// Run the server
app.listen(process.env.PORT, () => { console.log(`server started on port ${process.env.PORT}`)});

export default app;
