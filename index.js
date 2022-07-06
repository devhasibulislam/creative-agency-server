// required middleware
const express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// connect middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongodb connectivity
const uri = `mongodb+srv://creativeAgency:b2d5ef8d0d873c20feae72198400cc95@creative-agency.gsy16.mongodb.net/?retryWrites=true&w=majority`;
const database = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        await database.connect();

        // only available for admins
        const userCollection = database.db('creative_agency').collection('users');
        const adminServiceCollection = database.db('creative_agencies_admin').collection('service');
        // only available for customers
        const customerOrderCollection = database.db('creative_agencies_customer').collection('orders');
        const customerReviewCollection = database.db('creative_agencies_customer').collection('reviews');

        console.log('Creative agency server successfully connected!');

        // add user to db
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const body = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const doc = {
                $set: body
            }

            res.send(await userCollection.updateOne(filter, doc, options));
        })

        // get user form db
        app.get('/users', async (req, res) => {
            res.send(await userCollection.find({}).toArray());
        })

        // get admin of a user from db
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const role = user?.role === 'admin' && 'admin';

            res.send({ role: role });
        })

        // get customer email addresses else admin email address
        app.get('/emails', async (req, res) => {
            const query = { role: { $ne: 'admin' } };
            const option = {
                projection: { email: 1 }
            };
            res.send(await userCollection.find(query, option).toArray());
        })

        // make a customer an admin
        app.put('/email/:email', async (req, res) => {
            const email = req.params.email;
            const body = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const doc = {
                $set: body
            };
            res.send(await userCollection.updateOne(filter, doc, options));
        })

        // add service through admin
        app.post('/service', async (req, res) => {
            const body = req.body;
            const service = await adminServiceCollection.insertOne(body);
            res.send(service);
        })

        // show services from admin to customer
        app.get('/services', async (req, res) => {
            res.send(await adminServiceCollection.find({}).toArray());
        })

        // add review from user
        app.put('/review/:email', async (req, res) => {
            const email = req.params.email;
            const body = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const doc = {
                $set: body
            };
            const review = await customerReviewCollection.updateOne(filter, doc, options);
            res.send(review);
        })

        // get service name only to include
        app.get('/courses', async (req, res) => {
            const option = {
                projection: { name: 1 }
            };
            res.send(await adminServiceCollection.find({}, option).toArray());
        })

        // post an order from customer
        app.post('/order', async (req, res) => {
            const body = req.body;
            const course = await customerOrderCollection.insertOne(body);
            res.send(course);
        })

        // everything about customer order
        app.get('/orders', async (req, res) => {
            res.send(await customerOrderCollection.find({}).toArray());
        })

        // adding state from admin to customer order
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const doc = {
                $set: body
            };
            const order = await customerOrderCollection.updateOne(filter, doc, options);
            res.send(order);
        })
    } finally {
        // await database.close();
    }
} run().catch(console.dir);


// enable requests
app.get('/', (req, res) => {
    res.send(`<h1 align=center>Creative agency server Connected.</h1>`);
})

app.listen(port, () => {
    console.log(`Creative agency server listening on port ${port}`);
})
