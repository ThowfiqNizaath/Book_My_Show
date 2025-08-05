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
          <strong style="color: #f84565">${booking.show.movie.title}</strong> is
          confirmed.
        </p>
        <p>
          <strong>Date: </strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
          <br />
          <strong>Time:</strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        <p>Enjoy the Show! </p>
        <p>Thanks for booking with us! <br /> QuickShow Team</p>
      </div>`,
    });
  }
);

const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await showModel
        .find({
          showDateTime: { $gte: windowStart, $lte: in8Hours },
        })
        .populate("movie");

      const task = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;

        const users = await userModel
          .find({ _id: { $in: userIds } })
          .select("name email");

        for (const user of users) {
          task.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }

      return task;
    });

    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    const results = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
            body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${booking.user.name}</h2>
        <p>
          Your booking for
          <strong style="color: #f84565">${booking.show.movie.title}</strong> is
          confirmed.
        </p>
        <p>
          <strong>Date: </strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
          <br />
          <strong>Time:</strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        <p>Enjoy the Show! </p>
        <p>Thanks for booking with us! <br /> QuickShow Team</p>
      </div>`,
          })
        )
      );
    });

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed`
    }
  }
);

const sendNewShowNotications = inngest.createFunction(
  {id: "send-new-show-notification"},
  {event: 'app/show.added'},
  async({event}) => {
    const {movieTitle} = event.data;

    const users = await userModel.find({});

    for(const user of users){
      const userEmail = user.email;
      const userName = user.name;
      const subject = `Now Show Added: ${movieTitle}`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${userName}</h2>
        <p>We've just added a new show to our library:</p>
        <h3 style="color: #f84565; ">${movieTitle}</h3>
        <p>Visit our website</p>
        <br />
        <p>Thanks, <br /> QuickShow Team</p>
      </div>
      `;

      await sendEmail({
        to: userEmail,
        subject,
        body,
      })
    }
    return {message: "Notifications Sent."}
  }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  relaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotications
];
