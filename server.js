const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
const {getUserFromToken} = require('./controllers/auth');


const authRouter = require('./routes/authRoutes');
app.use('/auth', authRouter);
const courseRouter = require('./routes/courseRoutes');
app.use('/courses', courseRouter);
const learningRouter = require('./routes/learningRoutes');
app.use('/learning', learningRouter);

app.get("/", (req, res) => {
    const user =  getUserFromToken(req);
    res.json(user);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});