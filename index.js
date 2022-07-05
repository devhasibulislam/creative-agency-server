// required middleware
const express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// connect middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongodb connectivity
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@creative-agency.gsy16.mongodb.net/?retryWrites=true&w=majority`;
const database = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        await database.connect();

        const userCollection = database.db('creative_agency').collection('users');
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

            res.send({role: role});
        })
    } finally {
        // await database.close();
    }
} run().catch(console.dir);


// enable requests
app.get('/', (req, res) => {
    res.send(`<h1>Creative agency server Connected.</h1>`);
})

app.listen(port, () => {
    console.log(`Creative agency server listening on port ${port}`);
})
