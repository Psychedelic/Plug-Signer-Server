const { addDelegation, callRequest, queryRequest, readStateRequest, addBatchTransaction } = require('./controllers');

const app = require('express')();

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/batchTransaction', addBatchTransaction)
app.post('/delegation', addDelegation)
app.post('/call', callRequest)
app.post('/query', queryRequest)
app.post('readState', readStateRequest)


app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});
