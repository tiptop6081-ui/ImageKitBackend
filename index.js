require("dotenv").config();

const ImageKit = require("@imagekit/nodejs");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const https = require("https");

const upload = multer({
    dest: "uploads/"
});

const app = express();

app.use(express.static("public"));

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("ImageKit Backend is running!");

});

app.get("/test-android", (req, res) => {
    console.log("🔥 ANDROID TEST REQUEST RECEIVED");

    res.json({
        success: true,
        message: "Android can reach Render!"
    });
});

app.get("/test-imagekit", (req, res) => {
    try {
        const authParams = imagekit.helper.getAuthenticationParameters();

        res.json({
            success: true,
            message: "ImageKit connection is working!",
            expire: authParams.expire
        });
    } catch (error) {
        console.error("ImageKit test error:", error);

        res.status(500).json({
            success: false,
            message: "ImageKit connection failed"
        });
    }
});

app.get("/test-firebase", (req, res) => {
    const url =
        "https://onlinestore2-ba484-default-rtdb.firebaseio.com/products.json?shallow=true";

    https.get(url, (firebaseRes) => {

        let data = "";

        firebaseRes.on("data", (chunk) => {
            data += chunk;
        });

        firebaseRes.on("end", () => {

            res.status(firebaseRes.statusCode || 500).send(data);

        });

    }).on("error", (error) => {

        console.error("Firebase test error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    });
});

console.log("🔥 TEST ROUTE LOADED");
console.log("🔥 INDEX FILE IS RUNNING");

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

app.post("/upload", upload.single("image"), async (req, res) => {

console.log("🔥 /upload REQUEST RECEIVED");
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image received"
            });
        }

        const result = await imagekit.files.upload({
    file: fs.createReadStream(req.file.path),
    fileName: req.file.originalname
});

        res.json({
            success: true,
            message: "Image uploaded successfully!",
            url: result.url
        });

    } catch (error) {
        console.error("Upload error:", error);

        res.status(500).json({
            success: false,
            message: "Image upload failed"
        });
    }
});