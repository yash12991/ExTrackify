import dotenv from "dotenv"
dotenv.config();
import mongoose from "mongoose";
const DB_NAME= "expensedata";

const  connectDB = async ()=>{
  try {
   
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
      console.log(`\nMongo connectedDBHOST:  ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log(`\n error connection with mongo`,error)
   process.exit(1)
  }
}
export {connectDB}