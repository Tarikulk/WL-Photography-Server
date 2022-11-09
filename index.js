const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mtnim2c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
       const servicesCollection = client.db("servicesReview").collection("services"); 
       const reviewCollection = client.db("servicesReview").collection("reviews");

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
               
   app.get("/services/:id", async(req, res) =>{
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

app.get("/reviews", async(req, res) =>{
    let query = {};
    if(req.query.email){
        query={
            email : req.query.email
        }
    }
    const cursor = reviewCollection.find(query);
    const result = await cursor.toArray();
    
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
 