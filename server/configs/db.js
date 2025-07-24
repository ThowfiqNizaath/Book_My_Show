import mongoose from "mongoose";

const connectDB = async() => {
    try{
        mongoose.connection.on('connected', () => console.log('Database is connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);
        process.emit("connected")
    }catch(err){
        console.log(err)
    }
}

export default connectDB;