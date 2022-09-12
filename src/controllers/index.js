const { HttpAgent } = require('@dfinity/agent');
const { Principal } = require('@dfinity/principal');
const { uuid } = require('uuidv4');

const { createEphimeralKey, createDelegationIdentity, argumentsValidation, base64ToBuffer, bufferToBase64 } = require('../utils');
const ERROR = require('../utils/error');

const keyStorage = {}

const addBatchTransaction = (req, res) => {
  const { batchTxData } = req.body;
  const identity = createEphimeralKey();
  const publicKey = identity.getPublicKey().toString();
  const batchTxId = uuid();
  keyStorage[batchTxId] = { identity, batchTxData };
  return res.send({ batchTxId, publicKey }).status(200);
}

const addDelegation = (req, res) => {
  const { batchTxId, delegationChainJSON } = req.body;
  const batchTx = keyStorage[batchTxId];
  const delegationIdentity = createDelegationIdentity(identity, delegationChainJSON);
  keyStorage[batchTxId] = { identity, delegation: delegationIdentity, ...batchTx };
  return res.send().status(200);
}

const callRequest = async (req, res) => {
  const [metadata, args, batchTxId] = JSON.parse(req.body);
  console.log(JSON.parse(req.body));
  const { delegation, batchData } = keyStorage[batchTxId] || {};
  const { error, status } = argumentsValidation(batchTxId, args, delegation, batchData, metadata);
  if (error || status)
    return res.send({ error }).status(status);

  const agent = new HttpAgent({ identity: delegation });
  const response = await agent.call(Principal.fromText(request.canisterId), { methodName: args.methodName, arg: base64ToBuffer(args.arg) });
  return res.send({
    result: {
      ...response,
      requestId: bufferToBase64(response.requestId),
    }
  }).status(200);
}

const queryRequest = async (req, res) => {
  const [metadata, args, batchTxId] = JSON.parse(req.body);
  const { delegation, batchData } = keyStorage[batchTxId];
  const { error, status } = argumentsValidation(batchTxId, args, delegation, batchData, metadata);
  if (error || status)
    return res.send({ error }).status(status);

  const agent = new HttpAgent({ identity: delegation });
  const response = await agent.query(args.canisterId, { methodName: args.methodName, arg: base64ToBuffer(args.arg) });

  if (response.reply) {
    response.reply.arg = bufferToBase64(
      response.reply.arg
    );
  }

  return res.send({
    result: response,
  }).status(200);
}

const readStateRequest = async (req, res) => {
  const [metadata, { canisterId, paths }, batchTxId] = JSON.parse(req.body);
  const { delegation } = keyStorage[batchTxId];
  if (!delegation)
    return res.send({ error: ERROR.missingDelegation }).status(400);

  const agent = new HttpAgent({ identity: delegation });
  const response = await agent.readState(canisterId, {
    paths: [paths.map(path => base64ToBuffer(path))],
  });

  return res.send({
    result: {
      certificate: bufferToBase64(response.certificate),
    }
  }).status(200);
}
module.exports = { addDelegation, addBatchTransaction, callRequest, queryRequest, readStateRequest }