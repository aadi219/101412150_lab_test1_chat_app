import express from "express";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import path from "path";
import mongoose from "mongoose";
import PrivateMessage from "./models/privateMessage.js";
import GroupMessage from "./models/groupMessage.js";

const app = express();
const PORT = process.env.PORT || 3000;
const dirname = path.resolve(path.dirname(''));

// serve static html pages along with their scripts
app.use(express.static("view"));
app.use(express.json());

// connect to mongo
mongoose.connect("mongodb+srv://aadibadola:labtest01@cluster0.tfwphvd.mongodb.net/comp3133?retryWrites=true&w=majority&appName=Cluster0")
    .then(_ => {
        console.log("Connected to mongoDB");
    })
    .catch(err => {
        console.error("[ERR] Error while connecting to mongoDB:", err);
    });

// init routes
app.use('/', authRoutes);
app.use('/', chatRoutes);


const server = app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
})

const io = new Server(server);

// storing all currently connected users
let connectedUsers = [];
// function to remove user from array on disconnect or logout
function removeUser(socketId) {
    let userIdx = connectedUsers.findIndex(u => u.clientId == socketId);
    if (userIdx > -1) {
        connectedUsers.splice(userIdx)
        // trigger rerender for user list on all clients
        io.emit("update_clients", connectedUsers);
        console.log(connectedUsers);
    }
}

io.on('connection', (socket) => {
    console.log("New socket connection: " + socket.id);
    // disconnect removes user from array
    socket.on('disconnect', (reason) => {
        console.log(`Client (${socket.id}) disconnected, with reason: ${reason}`);
        removeUser(socket.id);
    });
    // logout removes user from array
    socket.on('logout', (socketId) => {
        let disconnectingUser = connectedUsers.find(u => u.clientId = socket.id);
        removeUser(socketId);
        console.log(`User: ${disconnectingUser.username} has logged out`);
    })
    
    socket.on("login", (data) => {
        // add user to array when logged in
        connectedUsers.push(data);
        // trigger rerender on all clients
        io.emit("update_clients", connectedUsers);
        console.log(connectedUsers);
    });

    socket.on("user_typing", (data) => {
        // update client when user is typing
        socket.to(data.roomName).emit("user_typing", data.username);
    });

    socket.on("join_room", async ({roomName, to, type}) => {
        // add client to room
        socket.join(roomName);
        console.log(`${socket.id} has now joined ${roomName}`);
        // init array of past messages for the room
        let pastMessages = [];
        switch (type) {
            case "private":
                let user1 = connectedUsers.find(u => u.clientId == socket.id).username;
                let user2 = connectedUsers.find(u => u.username == to).username;
                // for direct messages, find all messages with those two users
                pastMessages = await PrivateMessage.find({
                    $or: [
                    { from_user: user1, to_user: user2},
                    { from_user: user2, to_user: user1 }
                ]});
                break;
            case "group":
                // for group messages, find all messages for a group
                pastMessages = await GroupMessage.find({
                    room: roomName
                });
                break;
            default:
                console.log("invalid request");
        }
        console.log(pastMessages);
        // update client which is connecting
        // send roomName, to (username for direct, groupname for group), type (private, group), messages
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
            // create new private message
            newMessage = new PrivateMessage({
                from_user: data.from_user,
                to_user: data.to,
                message: data.message
            });
        }
        else if (data.type == "group") {
            // create new group message
            newMessage = new GroupMessage({
                from_user: data.from_user,
                room: data.to,
                message: data.message
            });
        }
        // save to db
        newMessage.save().then(_ => {
            console.log("message saved");
        })
        .catch(err => {
            console.log(err);
        })
        // update clients in room
        io.to(data.roomName).emit("new_message", {
                from_user: newMessage.from_user,
                message: newMessage.message 
            });
    })
})




