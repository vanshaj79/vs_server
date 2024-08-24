import dotenv from "dotenv";
import { app } from "./src/app.js";
dotenv.config({
    path:'./.env'
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log(`Server is Running at Port : ${process.env.PORT}`)
})
