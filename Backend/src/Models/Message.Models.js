import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    // receiverId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   // required: true,
    // },
    chat: { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "Chat" },
    // text: {
    //   type: String,
    // },
    // image: {
    //   type: String,
    //   default:"",
    // },
    content:{
      type:String,
    }
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);

