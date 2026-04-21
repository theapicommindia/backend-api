//backend/src/models/AdminModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const adminSchema =new mongoose.Schema(
    {
       name: { type: String, required: true },
       email: { type: String, required: true, unique: true },
       password: { type: String, required: true },
    },
    {timestamps:true}
);

//Hash Paassowrd before saving for security

adminSchema.pre("save",async function(){
    if(!this.isModified("password"))
        return;

    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});

// compare password
adminSchema.methods.matchPassword =
async function (enterdPassword) {
    return await bcrypt.compare(enterdPassword, this.password);
};

export default mongoose.model("Admin",adminSchema);