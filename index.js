const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8080;

// middleware
const app = express();
app.use(cors());
app.use(express.json());

// connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@recap2.uxmuk8w.mongodb.net/?retryWrites=true&w=majority&appName=recap2`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("user");

    // add a user
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get all users
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // user delete
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          lastLogin: user.lastLogin,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get all coffee
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single coffee
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(cursor);
      res.send(result);
    });

    // Add a coffee
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    // update coffee
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newCoffee = {
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        newCoffee,
        options
      );
      res.send(result);
    });

    // delete coffee
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// api
app.get("/", (req, res) => {
  res.send("<h1>Coffee Server running</h1>");
});

// listen
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
