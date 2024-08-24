//import { app } from "./app.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log(`Server is Running at Port : ${process.env.PORT}`)
})
