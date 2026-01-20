import express, { response } from "express";
import morgan from "morgan";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import authRouter from "./routes/auth.router.js";
import postsRouter from "./routes/post.router.js";
import errorMiddleware from "./error-handler/index.js";
import userRouter from "./routes/user.router.js";
import * as schema from "./db/schema.js"


const app = express();

app.use(express.json({limit: "10mb"}));

app.use(morgan('dev'));

export const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL,
    },
    schema: schema
})

app.get("/", (req, res) => {
    try {
        res.json({
            message: "Server Running"
        })
    } catch (error) {
        console.error("Something went wrong!")
        res.json({
            message: "Something went very wrong"
        })
    }
})

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);

app.use(errorMiddleware);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is listen on port ${PORT}`)
})