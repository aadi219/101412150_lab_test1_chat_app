import mongoose, { Schema } from "mongoose";

const PrivateMessageSchema = new Schema({
    from_user: {
        type: String,
        required: true, 
    },
    to_user: {
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

const PrivateMessage = mongoose.model('privateMessage', PrivateMessageSchema);

export default PrivateMessage;
