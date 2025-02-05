import mongoose, { Schema } from "mongoose";

const GroupMessageSchema = new Schema({
    from_user: {
        type: String,
        required: true, 
    },
    room: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

const GroupMessage = mongoose.model('groupMessage', GroupMessageSchema);

export default GroupMessage;

