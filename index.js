const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();

//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wc7jl9l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoriesCollection = client
      .db("bike-hunter")
      .collection("categories");
    const productCollection = client.db("bike-hunter").collection("products");
    const userCollection = client.db("bike-hunter").collection("users");
    const bookingCollection = client.db("bike-hunter").collection("bookings");

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });

    app.get("/categoriestype", async (req, res) => {
      const query = {};
      const result = await categoriesCollection
        .find(query)
        .project({ name: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/products/:name", async (req, res) => {
      const category = req.params.name;
      const query = {
        category: category,
      };

      const prodcuts = await productCollection.find(query).toArray();
      res.send(prodcuts);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;

      const query = {
        email: email,
      };
      const products = await productCollection.find(query).toArray();
      res.send(products);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const user = await userCollection.find(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(401).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const allUsers = await userCollection.find(query).toArray();
      res.send(allUsers);
    });

    app.get("/buyer", async (req, res) => {
      const buyer = req.query.buyer;
      const query = { usertype: buyer };
      const buyers = await userCollection.find(query).toArray();
      res.send(buyers);
    });

    app.delete("/buyer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/seller", async (req, res) => {
      const seller = req.query.seller;
      const query = { usertype: seller };
      const sellers = await userCollection.find(query).toArray();
      res.send(sellers);
    });

    app.delete("/seller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = userCollection.updateOne(filter, updatedDoc, options);
      console.log(result);
      res.send(result);
    });

    app.put("/advertise/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          advertise: "advertise",
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    app.get("/advertiseproducts", async (req, res) => {
      const query = {
        advertise: "advertise",

        status: "available",
      };
      const products = await productCollection.find(query).toArray();
      res.send(products);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const myOrders = await bookingCollection.find(query).toArray();
      res.send(myOrders);
    });

    app.patch("/productstatus/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "sold",
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("bike-hunter server is running");
});

app.listen(port, () => console.log(`bike-hunter server is running to ${port}`));
