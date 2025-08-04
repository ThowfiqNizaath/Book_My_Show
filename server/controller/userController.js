import { clerkClient } from "@clerk/express";
import bookingModel from "../models/bookingSchema.js";
import movieModel from "../models/movieSchema.js";

export const getUserBookings = async(req, res) => {
    try {
        const user = req.auth().userId;
        const bookings = await bookingModel.find({user}).populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1});

        return res.json({success: true, bookings})
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}

export const updateFavorite = async(req, res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = []
        }
        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(fav => fav !== movieId);
        }
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        })

        res.json({success: true, message: "Favorite updated successfully."})
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}

export const getFavorites = async(req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        const movies = await movieModel.find({_id:{$in: favorites}})

        res.json({success: true, movies})
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}