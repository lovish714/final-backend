import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnClaudinary} from "../utils/claudinary.js";
import {apiResponse} from "../utils/apiResponse.js";




const registerUser = asyncHandler( async (req , res)=>{
    const {fullname , email , username , password} = req.body
    console.log("email: " , email);

    if(
        [fullname , email , username , password].some((field)=> 
        field?.trim() === "")
    ){
        throw new apiError(400 , "All fields are required")
    }


    const existedUser = User.findOne({
        $or: [{username} , {email}]
    })

    if(existedUser){
        throw new apiError(409 , "User with email or username already exists")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400 , "Avatar file is required")
    }


    const avatar = await uploadOnClaudinary(avatarLocalPath)
    const coverImage = await uploadOnClaudinary(coverImageLocalPath)

    if(!avatar){
         throw new apiError(400 , "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const cretedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!cretedUser){
        throw new apiError(500 , "Something went wrong while registering the user")
    }


   return res.status(201).json(
    new apiResponse(200 , createdUser , "User registered successfully")
   ) 

//     // if (fullname === ""){
//     throw new apiError(400 , "fullname is required")
// }
})  



export {registerUser}