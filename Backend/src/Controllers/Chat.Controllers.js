import { asyncHandler } from "../Utils/AsyncHandler.js";
import { Chat } from "../Models/Chat.Models.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/User.Models.js";
import { app } from "../app.js";

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(400);
  }

  // Find existing 1-on-1 chat
  let isChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { members: { $elemMatch: { $eq: req.user._id } } },
      { members: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("members", "-password")
    .populate("latestMessage");

  // Populate sender info in latest message
  if (isChat) {
    isChat = await User.populate(isChat, {
      path: "latestMessage.senderId",
      select: "name pic email",
    });
    return res.status(200).json(new ApiResponse(200, isChat, "Chat already exists"));
  }

  // If no chat, create new one
  const chatData = {
    ChatName: "sender",
    isGroupChat: false,
    members: [req.user._id, userId],
  };

  const createdChat = await Chat.create(chatData);
  const fullChat = await Chat.findById(createdChat._id).populate("members", "-password");

  return res.status(200).json(new ApiResponse(200, fullChat, "New chat created"));
});

const fetchChats=asyncHandler(async(req,res)=>{
    await Chat.find({members:{$elemMatch:{$eq:req.user._id}}})
        .populate("members","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(result)=>{
            result=await User.populate(result,{
                path:"latestMessage.sender",
                select:"name pic email "
            });
            return res.status(200)
                    .json(new ApiResponse(200,result,"fetched chat successfully"));
        })
})

const createGroupChat = asyncHandler(async (req, res) => {
  const { members, chatName } = req.body;

  if (!members || !chatName) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  let parsedMembers;

  try {
    parsedMembers = typeof members === "string" ? JSON.parse(members) : members;
  } catch (err) {
    throw new ApiError(400, "Invalid JSON format for members array");
  }

  if (parsedMembers.length < 2) {
    throw new ApiError(400, "More than 2 users are required to form a group chat");
  }

  // Add the logged-in user to the members list
  parsedMembers.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      ChatName: chatName,
      members: parsedMembers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("members", "-password")
      .populate("groupAdmin", "-password");

    return res
      .status(200)
      .json(new ApiResponse(200, fullGroupChat, "Group chat created successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Something went wrong while creating the group chat");
  }
});

    const renameGroup=asyncHandler(async(req,res)=>{
       const {chatId,chatName} = req.body;
        if(!chatId){
            throw new ApiError(404,"chatID not found");
        }
        if(!chatName){
            throw new ApiError(404,"chat name is required for renamechat name");
        }


        const updatedChat=await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName,
            },
            {
                new :true,
            }
        )
        .populate("members","-password")
        .populate("groupAdmin","-password");

        if(!updatedChat){
            throw new ApiError(500,"something went wrong while update chat name");
        }
        return res.status(200)
                    .json(new ApiResponse(200,updatedChat,"chatname update successfully"));

    })

    const addToGroup=asyncHandler(async(req,res)=>{
        const {chatId,userId}=req.body;

        const added=await Chat.findByIdAndUpdate(
                chatId,
                {
                    $push:{members:userId},
                },
                {
                    new:true,
                }
        )
    if(!added){
        throw new ApiError(500,"something went wrong while adding member in  grp-chat ");
    }

    return res.status(200)
        .json(new ApiResponse(200,added,"user add successfully"));

});

const removeFromGrp=asyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;

    const removed=await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull:{members:userId},
            },
            {
                new:true,
            }
    )
if(!removed){
    throw new ApiError(500,"something went wrong while adding member in  grp-chat ");
}

return res.status(200)
    .json(new ApiResponse(200,removed,"user add successfully"));

})

export { accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGrp };
