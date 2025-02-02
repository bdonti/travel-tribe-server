const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app= express();
const port= process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iedqjux.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const touristSpotCollection = client.db('tourismDB').collection('spots');
    const countryCollection = client.db('tourismDB').collection('countries');

    app.get('/spots', async(req, res) =>{
        const cursor = touristSpotCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

      app.get('/spots/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await touristSpotCollection.findOne(query);
        res.send(result);
      })


    app.post('/spots', async (req, res) => {
        const newTouristSpot = req.body;
        console.log(newTouristSpot);
        const result = await touristSpotCollection.insertOne(newTouristSpot);
        res.send(result);
    })

    app.put('/spots/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert : true};
      const updatedTouristSpot = req.body;
      const spot ={
        $set: {
        url: updatedTouristSpot.url,
        touristsSpotName: updatedTouristSpot.touristsSpotName,
        countryName: updatedTouristSpot.countryName,
        location: updatedTouristSpot.location,
        description: updatedTouristSpot.description,
        averageCost: updatedTouristSpot.averageCost,
        season: updatedTouristSpot.season,
        travelTime: updatedTouristSpot.travelTime,
        totalVisitors: updatedTouristSpot.totalVisitors,
        }
      }
      const result = await touristSpotCollection.updateOne(filter, spot, options);
      res.send(result);
    })

    
    app.delete('/spots/:id', async(req,res) =>{
      const id= req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await touristSpotCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/countries', async(req, res) =>{
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/spots-by-country/:countryName', async (req, res)  => {
      const countryName = req.params.countryName;

      const spots = await touristSpotCollection.find({ countryName: countryName }).toArray();

      const country = await countryCollection.findOne({ countryName: countryName });

      let result = {
        country: country,
        spots: spots
    };

    res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send("Tourism Server is running");
})

app.listen(port, () =>{
    console.log(`Tourism Server is running on ${port} port`);
})