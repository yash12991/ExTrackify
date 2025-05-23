import mongoose,{Schema} from "mongoose";

const budgetSchema= new Schema({
  user:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  category:{
    type:String,
    required:true,
  },
  amount:{
    type:Number,
    required:true,
    min:0,
  },
  month:{
    type:Number,//0-11
    required:true,
  },
  year:{
    type:Number,
    required:true,
  }

},{timestamps:true})

budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);