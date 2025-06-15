const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
         Promise.resolve(requestHandler(req,res,next))
                .catch((err)=>next(err))
     }
 }
 export {asyncHandler};

 const emitEvent=(req,res,users,data)=>{
    console.log("Emitting event",event);
 }
 export {emitEvent}