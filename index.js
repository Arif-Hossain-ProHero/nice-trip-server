const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
//Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgy5g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//db system
async function run() {
  try {
    await client.connect();
    const database = client.db("nice-trip");
    const packageCollection = database.collection("packages");
    const orderCollection = database.collection("orders");
    const blogsCollection = database.collection("blogs");
    //GET Blogs API
    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    //GET Packages API
    app.get("/packages", async (req, res) => {
      const cursor = packageCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });
    //GET ORDERS API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //GET SINGLE USER
    app.get("/packages/:id", async (req, res) => {
      const package_id = req.params.id;
      const query = { _id: ObjectId(package_id) };
      const package = await packageCollection.findOne(query);
      console.log("getting single user");
      res.json(package);
    });
    //POST API
    app.post("/packages", async (req, res) => {
      const newPackage = req.body;
      const result = await packageCollection.insertOne(newPackage);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    //POST my Order
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    //UPDATE status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          packageId: updatedOrder.packageId,
          userName: updatedOrder.userName,
          userEmail: updatedOrder.userEmail,
          title: updatedOrder.title,
          price: updatedOrder.price,
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updated");
      res.json(result);
    });
    //DELETE My order API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("deleting user id:", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//other functionality
app.get("/", (req, res) => {
  res.send("Running my CRUD server");
});

app.listen(port, () => {
  console.log("Running server on port: ", port);
});
