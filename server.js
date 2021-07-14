// import libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

// initialise app
const app = express();

// app.use((req, res, next) => {
//   res.set({
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
//     'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
//     'Content-Security-Policy': 'default-src *',
//     'X-Content-Security-Policy': 'default-src *',
//     'X-WebKit-CSP': 'default-src *',
//   });
//   next();
// });

app.use(express.static('./gift/images'));
app.use(express.static('./gift/static'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());
app.use('/', routes);

// set port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
