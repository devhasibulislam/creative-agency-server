// required middleware
const express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// connect middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// enable requests
app.get('/', (req, res) => {
    res.send('Creative agency server Connected');
})

app.listen(port, () => {
    console.log(`Creative agency server listening on port ${port}`);
})
