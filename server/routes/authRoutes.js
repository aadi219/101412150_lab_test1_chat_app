import { Router } from "express";
import User from "../models/user.js";
import path from "path";

const router = Router();
const dirname = path.resolve(path.dirname(''));

// serve html page for signup
router.get("/signup", (req, res) => {
    res.sendFile(dirname + "/view/signup.html");
})

// serve html page for login 
router.get("/login", (req, res) => {
    res.sendFile(dirname + "/view/login.html");
})

// register new user
router.post("/signup", async (req, res) => {
    const {username, firstname, lastname, password} = req.body;
    try {
        const newUser = new User({
            username, firstname, lastname, password
        });
        await newUser.save();
        return res.status(201).json({message: "User added", userId: newUser.id});
    } catch(err) {
        console.log("[ERR] Error while creating user:", err);
        return res.status(500).json({message: "Error while adding user"});
    }
});

// authenticate user
router.post("/login", async (req, res) => {
    console.log(req.body);
    const {username, password} = req.body;
    const user = await User.findOne({username}).exec();
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }
    if (user.password == password) {
        return res.status(200).json({
            message: "Successful login",
            token: user.id,
            username: user.username
        });
    }
    return res.status(400).json({message: "Invalid username or password"});
})

export default router;