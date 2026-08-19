import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Verify RAW body
        const payload = req.body.toString();

        const evt = whook.verify(payload, headers);

        // Get data from verified webhook
        const { data, type } = evt;

       

        switch (type) {

            case "user.created": {

                 const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        };
                await User.create(userData);
                break;
            }

            case "user.updated": {
                
                 const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        };
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        res.status(200).json({
            success: true,
            message: "Webhook received",
        });

    } catch (error) {
        console.log("Webhook Error:", error.message);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export default clerkWebhooks;