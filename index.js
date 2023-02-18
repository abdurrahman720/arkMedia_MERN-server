import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const port = process.env.PORT || 5003;
app.use(cors());
app.use(express.json());
dotenv.config();

function jwtVerify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: "Invalid authorization header" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ error: err.message });
    }
    req.decoded = decoded;
    next();
  });
}

//connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rtntsud.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const users = client.db("arkMEDIA").collection("users");
    const posts = client.db("arkMEDIA").collection("posts");

    //user

    app.post("/add-users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await users.insertOne(user);
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = {
        userEmail: email,
      };
      const user = await users.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.TOKEN);
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/get-user", async (req, res) => {
      const email = req.query.email;
      const query = {
        userEmail: email,
      };
      const user = await users.findOne(query);
      res.send(user);
    });
    
      
      

    //verifyUser
    const verifyUser = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { userEmail: decodedEmail };
      const user = await users.findOne(query);
      if (!user) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      next();
    };

    //post
    app.post("/add-post", jwtVerify, verifyUser, async (req, res) => {
      const post = req.body;
      const result = await posts.insertOne(post);
      res.send(result);
    });

      //get post by time stamp
    app.get("/get-posts", async (req, res) => {
      const query = {};
      const allpost = await posts.find(query).sort({ timeStamp: -1 }).toArray();
      res.send(allpost);
    });
      
      //get 3 post with top like
      app.get("/get-posts/home", async (req, res) => {
  
          const topThreePost = await posts.find({ $expr: { $gt: [ { $size: "$likes" }, 0 ] } })
          .sort({ likes: -1 })
          .limit(3)
          .toArray();
          res.send(topThreePost);
      })

    //get post by post id
      app.get("/get-post/:id", async (req, res) => {
          const postId = req.params.id;
          console.log(postId)
          const query = { _id: new ObjectId(postId) };
          const post = await posts.findOne(query);
          console.log(post)
          res.send(post);
      })

    //get post by userId
      app.get('/get-posts/profile',async (req, res) => {
          const userId = req.query.userId;
          const query = { postUserId: userId };

          const results = await posts.find(query).toArray();
          res.send(results);

      });
      
      
    
    //like post
    app.patch("/like-post/:id", async (req, res) => {
      const postId = req.params.id;
      const likerId = req.body.likerId;
      const query = {
        _id: new ObjectId(postId),
      };
      const post = await posts.findOne(query);
      const likeIndex = post.likes.indexOf(likerId);

      if (likeIndex === -1) {
        post.likes.push(likerId);
      } else {
        post.likes.splice(likeIndex, 1);
      }
        const updatePost = {
            $set: 
                post
            
        }
        
        const result = await posts.updateOne(query, updatePost);
 

        res.send(result);
        
    });
    
    // comment post
    app.patch('/add-comments/:id', async (req, res) => {
        const comment = req.body;
        const postId = req.params.id;
        const query = {
            _id: new ObjectId(postId)
        }
    
        const post = await posts.findOne(query);
        const comments = post.comments;
        comments.push(comment)
    
        const updatePost = {
            $set: {
                comments: comments
            }
        }
    
        const result = await posts.updateOne(query, updatePost);
        res.send(result);
    })
    
      
      
      
  }
  finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("arkMedia is running");
});

app.listen(port, () => {
  console.log("arkDeals running on", port);
});
