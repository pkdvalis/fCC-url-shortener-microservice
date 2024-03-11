require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

//mongoose
const mongoose = require('mongoose');
const mongoUri = process.env['MONGO_URI']
mongoose.connect(mongoUri, { });

const urlSchema = new mongoose.Schema({
  _id: Number,
  fullurl: {
    type: String,
    required: true
  }
});

let Url = mongoose.model('Url', urlSchema);
let id = 0;

//find the next free id
async function setId() {
  let result = "start"
  while (result != null) {
    result = await Url.findById({_id: id});
    result == null ? null : id++
    
  }
  console.log("id set to", id)
};

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})'); //domain
  return !!pattern.test(str);
}

const createAndSaveUrl = async (input) => {
  const newurl = new Url({
    _id: id,
    fullurl: input});

  newurl.save();
  console.log('ID:',id, 'Created');
  id++;
};

async function getUrlById(urlId) {
  try {
    const data = await Url.findById(urlId, 'fullurl');
    console.log("get url by id:", urlId, id, data);
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:short?', async (req, res) => {
  const result = await Url.findById({ _id: req.params.short});
  res.redirect(result.fullurl);
});

app.post('/api/shorturl', async function(req, res) {
  if (!validURL(req.body.url)) {
         return res.json({ error: 'invalid url' });
  }
  await createAndSaveUrl(req.body.url);
  return res.json({original_url : req.body.url, short_url : id-1});
});

//initialize id to next free id
setId()

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
