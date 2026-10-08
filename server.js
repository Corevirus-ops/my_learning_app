const express = require("express");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());


const authRouter = require('./routes/authRoutes');
app.use('/auth', authRouter);
const courseRouter = require('./routes/courseRoutes');
app.use('/courses', courseRouter);

app.get("/", (req, res) => {
  res.redirect(process.env.CLIENT_URL);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});