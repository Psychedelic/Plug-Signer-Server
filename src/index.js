const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();

const { addDelegation, callRequest, queryRequest, readStateRequest, addBatchTransaction } = require('./controllers');

app.use(cors(
  {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
  }
));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!').status(200);
});

app.post('/batchTransaction', addBatchTransaction)
app.post('/delegation', addDelegation)
app.post('/call', callRequest)
app.post('/query', queryRequest)
app.post('readState', readStateRequest)

app.listen(3000, () => {
  console.log('HTTP Server running on port 3000');
});
