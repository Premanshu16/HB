import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database Connected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error;
    }
};

export default connectDB;