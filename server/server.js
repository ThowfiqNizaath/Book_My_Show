import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js';
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';
import showRoute from './Routes/showRoutes.js';
import bookingRouter from './Routes/bookingRouter.js';
import adminRouter from './Routes/adminRouter.js';
import userRouter from './Routes/userRouter.js';
import morgan from 'morgan';
import { stripeWebhooks } from './controller/stripeWebhooks.js';


const app = express();
const port = 3000

await connectDB();

app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

//Middleware
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware());
app.use(morgan("dev"));


//Routes
app.get("/", (req, res) => res.send("Server is Live!"))
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRoute)
app.use("/api/booking", bookingRouter)
app.use("/api/admin", adminRouter)
app.use("/api/user", userRouter)

//Listeners
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`))