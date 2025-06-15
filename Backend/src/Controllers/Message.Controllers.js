import { asyncHandler } from "../Utils/AsyncHandler.js";
import {Message} from "../Models/Message.Models.js";
import {User} from "../Models/User.Models.js";
import {Chat} from "../Models/Chat.Models.js";
import { ApiError } from "../Utils/ApiErrors.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    throw new ApiError(400, "Invalid data passed");
  }

  const newMessage = {
    content,
    senderId: req.user._id,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("senderId", "fullname avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "fullname avatar email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Message sent successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while sending message", error);
  }
});

const allMessages=asyncHandler(async(req,res)=>{

  try {
    const {chat}=req.params;
    if(!chat){
      throw new ApiError(404,"chatId not found");
    }
    const messages=await Message.find({chat})
                              .populate("senderId","username,avatar,email")
                              .populate("chat");
    console.log("message",messages);
                        return res.status(200)
                                  .json(new ApiResponse(200,messages,"fetch all msg successfully"));

  } catch (error) {
    throw new ApiError(500,"something went wrong while")
  }
})

export { sendMessage ,allMessages};



// Why Three Separate Populations?
// First population gets basic sender info to show who sent the message

// Second population gets the chat context

// Third population gets details about all participants in the chat

// This is more efficient than doing one massive population because:

// You can selectively choose which fields to include at each step

// You can control the depth of population

// It's clearer to understand what data you're getting at each stage

// Real-world Analogy
// Imagine you're looking at a text message on your phone:

// First you see who sent it (sender info)

// Then you see which group chat it's in (chat info)

// Then you might want to see who else is in that group (chat users info)

// Each step gives you more context about the message.