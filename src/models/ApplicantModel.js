//backend/src/models/ApplicantModel.js
import mongoose from "mongoose";

const AppliacantSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"]
    },
    phone:{
        type:String,
        required:[true,"Phone number is required"]
    },
    email:{
        type:String,
        unique:[true,"Email alredy registered"],
    },
    intrest:{
        type:String,
        enum:["volunteer","Management","Social Creation","Design"],
        required:[true,"Please enter you intrest"]
    }
});

const Applicant=mongoose.model("Applicant",AppliacantSchema);

export default Applicant;
