import express from "express"
import { createBooking, getOccupiedSeats } from "../controller/movieController.js";

const bookingRouter = express.Router();


bookingRouter.get("/seats/:showId", getOccupiedSeats)
bookingRouter.post("/create", createBooking)


export default bookingRouter;