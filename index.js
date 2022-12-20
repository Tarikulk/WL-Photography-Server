const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken")
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mtnim2c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: "unauthorized access"})
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
          return  res.status(403).send({message: "forbidden access"})
        }
        req.decoded = decoded
        next()
    });
}

async function run (){
    try{
       const servicesCollection = client.db("servicesReview").collection("services"); 
       const reviewCollection = client.db("servicesReview").collection("reviews");

           
            app.post("/jwt", (req, res) =>{
                const user = req.body;
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"10h"})
                res.send({token})
            })

            app.get("/services", async(req, res) =>{
               const query = {};
               const cursor = servicesCollection.find(query);
               const result = await cursor.limit(3).toArray();
               res.send(result);
            });

            app.get("/allServices", async(req, res) =>{
                const query = {};
                const cursor = servicesCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            });
               
            app.get("/services/:id",  async(req, res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const servicesDetail = await servicesCollection.findOne(query);
              res.send(servicesDetail);
            });

            app.post("/allServices", async(req, res) =>{
              const allServices = req.body;
              const result = await servicesCollection.insertOne(allServices);
              res.send(result);
            })

           //   All Reviews 

           app.post("/reviews", async(req, res) =>{
              const reviews = req.body;
              const result = await reviewCollection.insertOne(reviews);
              res.send(result);
          })


          app.get("/allReviews", async(req, res) =>{
            let query = {};
               if(req.query?.email){
                  query={
                    email : req.query.email
                }
         }
            const cursor = reviewCollection.find(query).sort({date: 1})
            const result = await cursor.toArray();
           res.send(result)
          })
 

          app.get("/reviews", verifyJWT,  async(req, res) =>{ 
              const decoded = req.decoded;
              if(decoded?.email !==  req.query.email){
                res.status(403).send({message: "unauthorized access"})
              }
             
              let query = {};
               if(req.query?.email){
                  query={
                    email : req.query.email
                }
         }
            const cursor = reviewCollection.find(query) 
            const result = await cursor.toArray();
           res.send(result)
          }) 

          app.get("/reviews/:id", async(req, res) =>{
              const id = req.params.id;
              const query = {_id : ObjectId(id)}
              const reviews = await reviewCollection.findOne(query)
              console.log(reviews)
              res.send(reviews);
          })

          app.put("/updateReviews/:id", async(req, res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const reviews = req.body;
              const option = {upsert: true}
              const updatedReview = {
                $set:{
                    name: reviews.name,
                    review: reviews.review
                }
              }
              const result = await reviewCollection.updateOne(query, updatedReview, option);
              res.send(result)
          })
           
          app.delete("/reviews/:id", async(req, res) =>{
              const id = req.params.id;
              const query = {_id: ObjectId(id)};
              const result = await reviewCollection.deleteOne(query);
            res.send(result);
          })
         

           }
       finally{

    }
}

run().catch(error => console.error(error));



app.get("/", (req, res) =>{
    res.send("Wild-Life Photography Reviews Server Is Running");
});

app.listen(port, () =>{
    console.log(`This server is running on port ${port}`);
});
 