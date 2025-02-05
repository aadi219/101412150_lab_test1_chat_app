import path from "path";
import { Router } from "express";
import PrivateMessage from "../models/privateMessage.js";

const router = Router();
const dirname = path.resolve(path.dirname(''));


router.get('/rooms', (req, res) => {
    res.sendFile(dirname + "/view/chatRooms.html");
})

/*
router.get('/message/direct', async (req, res) => {
    const {user1, user2} = req.query;
    if (!user1|| !user2) {
        return res.status(400).json({message: "Users not provided"});
    }
    let messages = await PrivateMessage.find({
        $or: [
        { from_user: user1, to_user: user2 },
        { from_user: user2, to_user: user1 }
    ]});
    return res.status(200).json(messages);
});
*/
/*
router.post('/message/direct', async (req, res) => {
    const {from_user, to_user, message} = req.body;
    try {
        const newMsg = await PrivateMessage({
            from_user, to_user, message
        });
        return res.status(201).json({message: "Message added"});
    }
    catch(err) {
        return res.status(500).json({message: "error while adding message"});
        console.log(err);
    }
})
*/

export default router;