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

function jwtVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ error: 'Invalid authorization header' });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ error: err.message });
        }
        req.decoded = decoded;
        next();
    })
}


//connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rtntsud.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const users = client.db("arkMEDIA").collection("users");
        const posts = client.db("arkMEDIA").collection("posts");
       
        //user
        
        app.post("/add-users", async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await users.insertOne(user);
            res.send(result);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {
                userEmail: email
            };
            const user = await users.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.TOKEN);
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: "" })
        });

        //verifyUser
        const verifyUser = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await users.findOne(query);
            if (!user) {
                return res.status(403).send({ message: "Forbidden Access" });
            }
            next();
        };


        //post
        app.post('/add-posts',jwtVerify,verifyUser, async (req, res) => {
            const id = req.params.id;
            const post = req.body;
            const result = await posts.insertOne(post);
            const query = {};
            const allpost = await posts.find(query).toArray();
            res.send(allpost);

        });

        app.get('/get-posts', async (req, res) => {
            const query = {};
            const allpost = await posts.find(query).toArray();
            res.send(allpost);
            
        });
        

        app.patch('/like-post/:id',async (req, res) => {
            const postId = req.params.id;

        });

    }
    finally {
        
    }
};

run().catch((err) => console.log(err));




app.get('/', (req, res) => {
    res.send("arkMedia is running");
});

app.listen(port, () => {
    console.log("arkDeals running on", port);
});

