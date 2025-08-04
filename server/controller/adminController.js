import bookingModel from "../models/bookingSchema.js";
import showModel from "../models/showSchema.js";
import userModel from "../models/userSchema.js";

export const isAdmin = async (req, res) => {
  try {
    res.json({success: true, isAdmin: true})
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};


export const getDashboardData = async(req, res) => {
    try {
        const bookings = await bookingModel.find({isPaid: true})
        const activeShows = await showModel.find({showDateTime: {$gte: new Date()}}).populate("movie");
        const totalUser = await userModel.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        return res.json({success: true, dashboardData})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}


export const getAllShows = async(req, res) => {
    try {
        const shows = await showModel.find({showDateTime: {$gte: new Date()}}).populate("movie").sort({showDateTime: 1})
        return res.json({success: true, shows})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

export const getAllBookings = async(req, res) => {
    try {
        const bookings = await bookingModel.find().populate("user").populate({
            path: 'show',
            populate: {
                path: 'movie'
            }
        }).sort({createdAt: -1})
        return res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "Failed to delete shows" });
    }
}

export const deletePreviousShows = async(req, res) => {
    try{
        await showModel.deleteMany({showDateTime: {$lt: new Date()}});
        res.json({success: true, message: "Deleted shows successfull"})
    }catch(err){
        console.error(err)
        res.json({success: false, message: err.message})
    }
}