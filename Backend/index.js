import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Express app error: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
