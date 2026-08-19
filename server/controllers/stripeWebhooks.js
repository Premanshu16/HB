import stripe from "stripe";
import Booking from "../models/Booking.js";

// API to handle Stripe webhooks
export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook Error:", error.message);

        return response
            .status(400)
            .send(`Webhook Error: ${error.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            const bookingId = session.metadata?.bookingId;

            if (!bookingId) {
                console.error("Booking ID missing from Stripe metadata");
                return response.json({ received: true });
            }

            await Booking.findByIdAndUpdate(
                bookingId,
                {
                    $set: {
                        isPaid: true,
                        paymentMethod: "Stripe",
                    },
                }
            );

            console.log("Booking payment updated:", bookingId);
        } else {
            console.log("Unhandled event type:", event.type);
        }

        response.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error.message);

        response.status(500).json({
            success: false,
            message: error.message,
        });
    }
};