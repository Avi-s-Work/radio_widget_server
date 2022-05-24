const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: "*",
  })
);
// app.use(cors());
app.use(express.json());

//URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cvpyv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Main Async Function
async function run() {
  try {
    await client.connect();
    // console.log('Successfully Connected');
    const database = client.db("radioWidget");
    const stationCollection = database.collection("stations");
    const stationNameCollection = database.collection("stationsNames");
    const userCollection = database.collection("users");

    //GET All Packages API
    app.get("/stations", async (req, res) => {
      const cursor = stationCollection.find({});
      const stations = await cursor.toArray();
      res.json(stations);
    });

    // POST API For All Station Names
    app.post("/stationNames", async (req, res) => {
      const name = req.body;
      console.log(name);
      const result = await stationNameCollection.insertOne(name);
      console.log(result);
      res.json(result);
    });

    //Get All Station Names
    app.get("/stationNames", async (req, res) => {
      const cursor = stationNameCollection.find({});
      const names = await cursor.toArray();
      res.json(names);
    });

    // Delete Station
    app.delete("/stationNames/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await stationNameCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    //Station Name Edit
    app.put("/stationNames/:id", async (req, res) => {
      const id = req.params.id;
      const newStation = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          singleStationName: newStation.name,
          singleStationFrequency: newStation.frequency,
        },
      };
      const result = await stationNameCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(result);
      console.log(result);
    });

    //POST API For Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //Get Users API
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    //Upsert SignIn
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//Test The Server Connection
app.get("/", (req, res) => {
  res.send("Running Radio Widget Server.");
});

app.listen(port, () => {
  console.log("Welcome to PORT", port);
});
