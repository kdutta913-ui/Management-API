require("dotenv").config();

const connectDB = require("./config.db");
const app = require("./src/app");

const PORT = process.env.PORT;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();


