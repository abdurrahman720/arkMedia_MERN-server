import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 5003;
app.use(cors());
app.use(express.json());
dotenv.config();


//connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rtntsud.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const users = client.db("arkMEDIA").collection("users");
        const posts = client.db("arkMEDIA").collection("posts");
        
        app.post("/add-users", async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            res.send(result);
        });

    }
    finally {
        
    }
}




app.get('/', (req, res) => {
    res.send("arkMedia is running");
});

app.listen(port, () => {
    console.log("arkDeals running on", port);
});

