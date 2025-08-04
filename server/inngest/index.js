import { Inngest } from "inngest";
import userModel from "../models/userSchema.js";
import bookingModel from "../models/bookingSchema.js";
import showModel from "../models/showSchema.js";
import { populate } from "dotenv";
import { model } from "mongoose";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await userModel.create(userData);
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await userModel.findByIdAndDelete(id);
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, image_url, email_addresses } =
      event.data;
    const userData = {
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await userModel.findByIdAndUpdate(id, userData);
  }
);

const relaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMintesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMintesLater);
    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await bookingModel.findById(bookingId);

      if (!booking.isPaid) {
        const show = await showModel.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await bookingModel.findByIdAndDelete(booking._id);
      }
    });
  }
);

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;
    const booking = await bookingModel
      .findById(bookingId)
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie",
        },
      })
      .populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${booking.user.name}</h2>
        <p>
          Your booking for
          <strong style="color: #f84565">{booking.show.movie.title}</strong> is
          confirmed.
        </p>
        <p>
          <strong>Date: </strong> $
          {new Date(booking.show.showDateTime).toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
          })}{" "}
          <br />
          <strong>Time:</strong> $
          {new Date(booking.show.showDateTime).toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        <p>Enjoy the Show! </p>
        <p>Thanks for booking with us! <br /> --QuickShow Team</p>
      </div>`,
    });
  }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  relaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail
];
