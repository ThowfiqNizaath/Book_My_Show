
import stripe from "stripe";
import bookingModel from "../models/bookingSchema.js";

export const stripeWebhooks = async(request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const sig = request.headers["stripe-signature"];
        let event;
    try {
         event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }
    try{
       switch (event.type) {
         case "payment_intent.succeeded":
           const paymentIntent = event.data.object;
           const sessionList = await stripeInstance.checkout.session.list({
             payment_intent: paymentIntent.id,
           });
           const session = sessionList.data[0];
           const { bookingId } = session.metadata;

           await bookingModel.findByIdAndUpdate(bookingId, {
             isPaid: true,
             paymentLink: "",
           });
           break;

         default:
           console.log("Unhandled event type:", event.type);
           break;
       }
       response.json({received: true})
    }catch(error){
      console.log(error)
      response.status(500).send(error.message)
    }
}