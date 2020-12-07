const users = require('./routes/user');
const cvs = require('./routes/cv');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
let cors = require('cors');
const fs = require('fs-extra');
const app = express();



// exporting header  
const corsOptions = {
  exposedHeaders: 'x-auth-token',
};
app.use(cors(corsOptions));

// routes
app.get('/', (req, res) => {
  res.send('silence is golden');
});

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(fileUpload());
console.log("working");
console.log(__dirname + "/public");

app.use(express.static(__dirname + '/public'));
// app.set('views', __dirname + '/public/apidoc');
// app.set('images', __dirname + '/public/profileImages');
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'html'); 

app.use('/api/users', users);
app.use('/api/cv', cvs);


//Database Configuration
mongoose
  .connect('mongodb://localhost/silo-social', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to the database'))
  .catch((e) => console.log('Could not connect to database', e.message));
// disabling warnings
mongoose.set('useFindAndModify', false);

// PORT Configuration
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listennin on port ${port}..`));
