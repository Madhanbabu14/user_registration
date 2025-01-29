const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const userRoutes = require("./routes/userRoutes");
const urlRouter = require("./routes/urlRoutes")
const auth = require("./routes/auth");
const { User } = require("./config/db");
const analyticsRouter = require("./routes/Analytics");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/shorten", urlRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/", auth);

async function user_create() {
    const adminPassword = 'admin@123#';

    try {
        const admin = await User.findOne({ raw: true, where: { role: 'admin' } });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 8);
            const obj = {
                username: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin'
            };
            await User.create(obj);
            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error during admin user creation:", error);
    }
}

user_create();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));