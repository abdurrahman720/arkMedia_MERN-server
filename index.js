import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";


const app = express();
const port = process.env.PORT || 5003;
app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/', (req, res) => {
    res.send("arkMedia is running");
});

app.listen(port, () => {
    console.log("arkDeals running on", port);
});

