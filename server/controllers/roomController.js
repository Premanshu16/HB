import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;

        const hotel = await Hotel.findOne({ owner: req.user._id });

        if (!hotel) {
            return res.json({
                success: false,
                message: "No Hotel found"
            });
        }


        // Upload images to Cloudinary

console.log("Cloudinary check:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key_exists: !!process.env.CLOUDINARY_API_KEY,
    api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
});

const uploadImages = req.files.map(async (file) => {
    try {
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            error: error.error
        });
        throw error;
    }
});


        // Wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        });

        res.json({
            success: true,
            message: "Room created successfully"
        });

    } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR HTTP CODE:", error.http_code);

    res.json({
        success: false,
        message: error.message
    });
}
};


// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            isAvailable: true
        })
            .populate({
                path: "hotel",
                populate: {
                    path: "owner",
                    select: "image"
                }
            })
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            rooms
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({
            owner: req.auth.userId
        });

        if (!hotelData) {
            return res.json({
                success: false,
                message: "No Hotel found"
            });
        }

        const rooms = await Room.find({
            hotel: hotelData._id
        }).populate("hotel");

        res.json({
            success: true,
            rooms
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        const roomData = await Room.findById(roomId);

        if (!roomData) {
            return res.json({
                success: false,
                message: "Room not found"
            });
        }

        roomData.isAvailable = !roomData.isAvailable;

        await roomData.save();

        res.json({
            success: true,
            message: "Room availability updated"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};