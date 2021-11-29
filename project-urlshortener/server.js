require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortId = require('shortid');
const validUrl = require('valid-url');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }
);

const Schema = mongoose.Schema;
const shortUrlSchema = new Schema({
  original_url: String,
  short_url: String
});

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  
  try {
    
    const url = req.body.url;
    const urlCode = shortId.generate();

    if (!validUrl.isWebUri(url)) {
      return res.json({error: 'invalid url'});
    } 

    let foundUrl = await ShortUrl.findOne({original_url: url});

    if (!foundUrl) {
      foundUrl = new ShortUrl({
        original_url: url, 
        short_url: urlCode
      });

      await foundUrl.save();
    }

    res.json(foundUrl);

  } catch (error) {
    console.error(error);
    res.status(500).json('Server error...');
  }

});

app.get('/api/shorturl/:short_url?', async (req, res) => {
  
  try {
  
    const url = req.params.short_url;
    const foundUrl = await ShortUrl.findOne({ short_url: url});

    if (foundUrl) {
      return res.redirect(foundUrl.original_url);
    } else {
      return res.status(404).json('No URL found');
    }

  } catch (error) {
    console.log(error);
    res.status(500).json('Server error...');
  }

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
