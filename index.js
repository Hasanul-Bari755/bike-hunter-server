const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SK);

//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wc7jl9l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const categoriesCollection = client
      .db("bike-hunter")
      .collection("categories");
    const productCollection = client.db("bike-hunter").collection("products");
    const userCollection = client.db("bike-hunter").collection("users");
    const bookingCollection = client.db("bike-hunter").collection("bookings");
    const paymentCollection = client.db("bike-hunter").collection("payments");

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
        status: "available",
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

    app.get("/reportedproducts", async (req, res) => {
      const query = {
        report: true,
      };
      const reportedProducts = await productCollection.find(query).toArray();
      res.send(reportedProducts);
    });

    app.delete("/reportedProductDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/report/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          report: true,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
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

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollection.findOne(query);
      res.send(booking);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const myOrders = await bookingCollection.find(query).toArray();
      res.send(myOrders);
    });

    // app.patch("/productstatus/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       status: "sold",
    //     },
    //   };
    //   const result = await productCollection.updateOne(
    //     filter,
    //     updateDoc,
    //     options
    //   );
    //   res.send(result);
    // });

    app.delete("/myproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/verify", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verifystatus: "verified",
        },
      };
      const result = await productCollection.updateMany(
        filter,
        updatedDoc,
        options
      );
      const verifyseller = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/verifyseller", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const seller = await userCollection.findOne(query);
      res.send(seller);
    });

    app.patch("/paidStatusUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          paid: true,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.patch("/statusUpdate/:productId", async (req, res) => {
      const id = req.params.productId;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Sold",
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const price = order.price;

      const amount = price;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);

      res.send(result);
    });

    // app.get("/status", async (req, res) => {
    //   const filter = {};
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       paid: false,
    //     },
    //   };
    //   const result = await bookingCollection.updateMany(
    //     filter,
    //     updateDoc,
    //     options
    //   );
    //   res.send(result);
    // });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("bike-hunter server is running");
});

app.listen(port, () => console.log(`bike-hunter server is running to ${port}`));
