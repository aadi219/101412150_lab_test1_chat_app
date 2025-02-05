import express from "express";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const dirname = path.resolve(path.dirname(''));

app.use(express.static("view"));
app.use(express.json());

mongoose.connect("mongodb+srv://aadibadola:labtest01@cluster0.tfwphvd.mongodb.net/comp3133?retryWrites=true&w=majority&appName=Cluster0")
    .then(_ => {
        console.log("Connected to mongoDB");
    })
    .catch(err => {
        console.error("[ERR] Error while connecting to mongoDB:", err);
    });

app.use('/', authRoutes);

const server = app.listen(PORT, () => {
    console.log(dirname)
    console.log("Server running on port: " + PORT);
})

