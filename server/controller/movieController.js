import { inngest } from "../inngest/index.js";
import bookingModel from "../models/bookingSchema.js";
import showModel from "../models/showSchema.js"
import stripe from 'stripe'


const checkSeatsAvailability = async(showId, selectedSeats) => {
    try {
        const showData = await showModel.findById(showId);
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        // console.log(occupiedSeats)

        const isAnySeatTaken = await selectedSeats.some(seat => occupiedSeats[seat])

        return !isAnySeatTaken
    } catch (error) {
        console.log(error.message)
        return false
    }
}

export const createBooking = async(req, res) => {
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const {origin} = req.headers;

        // console.log(selectedSeats)

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        const showData = await showModel.findById(showId).populate("movie")

        const booking = await bookingModel.create({
          user: userId,
          show: showId,
          amount: showData.showPrice * selectedSeats.length,
          bookedSeats: selectedSeats,
        });

        await selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        })

        booking.paymentLink = session.url;
        await booking.save();

        await inngest.send({
            name: "app/checkpayment",
            data:{
                bookingId: booking._id.toString()
            }
        })

        return res.json({success: true, url: session.url})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}


export const getOccupiedSeats = async(req, res) => {
    try {
        const {showId} = req.params;
        const showData = await showModel.findById(showId)
        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({success: true, occupiedSeats})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}