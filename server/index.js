import express from "express";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import path from "path";
import mongoose from "mongoose";
import User from "./models/user.js";
import PrivateMessage from "./models/privateMessage.js";
import GroupMessage from "./models/groupMessage.js";

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
app.use('/', chatRoutes);

const server = app.listen(PORT, () => {
    console.log(dirname)
    console.log("Server running on port: " + PORT);
})

const io = new Server(server);

let connectedUsers = [];
function removeUser(socketId) {
    let userIdx = connectedUsers.findIndex(u => u.clientId == socketId);
    if (userIdx > -1) {
        connectedUsers.splice(userIdx)
        io.emit("update_clients", connectedUsers);
        console.log(connectedUsers);
    }
}
io.on('connection', (socket) => {
    console.log("New socket connection: " + socket.id);
    socket.on('disconnect', (reason) => {
        console.log(`Client (${socket.id}) disconnected, with reason: ${reason}`);
        removeUser(socket.id);
    });
    socket.on('logout', (socketId) => {
        let disconnectingUser = connectedUsers.find(u => u.clientId = socket.id);
        console.log(`User: ${disconnectingUser.username} has logged out`);
    })
    socket.on("login", (data) => {
        connectedUsers.push(data);
        io.emit("update_clients", connectedUsers);
        console.log(connectedUsers);
    });
    socket.on("user_typing", (data) => {
        console.log("user typgin")
        console.log(data);
        socket.to(data.roomName).emit("user_typing", data.username);
    });
    socket.on("join_room", async ({roomName, to, type}) => {
        socket.join(roomName);
        console.log(`${socket.id} has now joined ${roomName}`);
        let pastMessages = [];
        switch (type) {
            case "private":
                let user1 = connectedUsers.find(u => u.clientId == socket.id).username;
                let user2 = connectedUsers.find(u => u.username == to).username;
                pastMessages = await PrivateMessage.find({
                    $or: [
                    { from_user: user1, to_user: user2},
                    { from_user: user2, to_user: user1 }
                ]});
                break;
            case "group":
                pastMessages = await GroupMessage.find({
                    room: roomName
                });
                break;
            default:
                console.log("invalid request");
        }
        console.log(pastMessages);
        io.to(socket.id).emit("joined_room", {
            roomName,
            to,
            type,
            messages: pastMessages
        });
    })
    socket.on("new_message", (data) => {
        let newMessage;
        if (data.type == "private") {
            newMessage = new PrivateMessage({
                from_user: data.from_user,
                to_user: data.to,
                message: data.message
            });
            
            // newMessage.save().then(_ => {
            //     console.log("message saved");
            // })
            // .catch(err => {
            //     console.log(err);
            // })
        }
        else if (data.type == "group") {
            newMessage = new GroupMessage({
                from_user: data.from_user,
                room: data.to,
                message: data.message
            });
        }
        io.to(data.roomName).emit("new_message", {
                from_user: newMessage.from_user,
                message: newMessage.message 
            });
    })
})




