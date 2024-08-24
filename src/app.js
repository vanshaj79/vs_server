import express from "express";
import cors from "cors";
import appRoute from './routes/route.js'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.json({ limit: "16kb" }));

app.use('/api',appRoute)

export { app }