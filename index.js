const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

console.log(process.env);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vlrcl7k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("hobmeetData");
    const groupCollection = database.collection("groupCollection");

    app.get("/groups", async (req, res) => {
      const cursor = groupCollection.find() || {};
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/group/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.findOne(query);
      res.send(result);
    });

    app.get("/myGroups/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await groupCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/ongoingGroups", async (req, res) => {
      const today = new Date().toISOString().split("T")[0];
      const query = { date: { $gt: today } };
      const result = await groupCollection.find(query).limit(8).toArray();
      res.send(result);
    });

    app.get("/groups-by-category", async (req, res) => {
      const category = req.query.category ;
      if(req.query.category === "All"){
        const result = await groupCollection.find().toArray();
        res.send(result)
      }
      const query = {
        hobbyCategory:{$regex: new RegExp(`^${category}$`, "i")}
      }
      const result = await groupCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/groups", async (req, res) => {
      const groupData = req.body;
      const result = await groupCollection.insertOne(groupData);
      res.send(result);
    });

    app.put("/group/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newGrpData = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: newGrpData,
      };
      const result = await groupCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/group/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await groupCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello this is hobmeet server");
});

app.listen(port, () => {
  console.log(`hobmeet is running on port ${port}`);
});
