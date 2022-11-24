const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

//middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wc7jl9l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
    const categoriesCollection = client.db('bike-hunter').collection('categories');
    const productCollection = client.db('bike-hunter').collection('products');

        app.get('/categories', async (req, res) => {
             
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        })

      
        app.get('/categoriestype', async (req, res)=>{
            const query = {};
            const result = await categoriesCollection.find(query).project({ name: 1 }).toArray();
            res.send(result)
        })

        app.get('/products/:name', async (req, res) => {
            const category = req.params.name
            const query = {
                category: category
            }

            const prodcuts = await productCollection.find(query).toArray();
            res.send(prodcuts)
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(console.log)



app.get('/', async (req, res) => {
    res.send('bike-hunter server is running..');
})

app.listen(port, ()=> console.log(`bike-hunter server is running to ${port}`))