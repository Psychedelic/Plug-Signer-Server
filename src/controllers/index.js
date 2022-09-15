const { uuid } = require('uuidv4');

const { createEphimeralKey, createDelegationIdentity, argumentsValidation, base64ToBuffer, bufferToBase64, arrayBufferToBase64 } = require('../utils');
const ERROR = require('../utils/error');
const { getNextTxData, getKey, updateKey } = require('../utils/key-storage');
const { call, query, readState } = require('../utils/ic');


const addBatchTransaction = (req, res) => {
  try {
    const { batchTxData, metadata, host } = req.body;
    const identity = createEphimeralKey();
    const publicKey = identity.getPublicKey().toDer();
    const batchTxId = uuid();
    updateKey(batchTxId, { identity, batchTxData, metadata, host });
    return res.send({ batchTxId, derPublicKey: arrayBufferToBase64(publicKey) }).status(200);
  } catch (error) {
    return res.send({ error }).status(500);
  }

}

const addDelegation = (req, res) => {
  try {
    const { batchTxId, delegationChainJSON } = req.body;
    const { identity } = getKey(batchTxId) || {};
    const delegationIdentity = createDelegationIdentity(identity, delegationChainJSON);
    updateKey(batchTxId, { delegation: delegationIdentity });
    return res.send().status(200);
  } catch (error) {
    return res.send({ error }).status(500);
  }
}

const callRequest = async (req, res) => {
  const [metadata, args, batchTxId] = req.body;
  const { delegation, metadata: savedMetadata, host, ...data } = getKey(batchTxId) || {};
  const savedTxData = getNextTxData(batchTxId);
  const { error, status: valStatus } = argumentsValidation(savedTxData, savedMetadata, args, metadata, delegation);
  if (error || valStatus) {
    updateKey(batchTxId, { delegation, metadata: savedMetadata, host, ...data });
    return res.send({ error }).status(valStatus);
  }

  const { response, status } = await call(args, delegation, host);

  return res.send(response).status(status);
}

const queryRequest = async (req, res) => {
  const [metadata, args, batchTxId] = req.body;
  const { delegation, metadata: savedMetadata, host, ...data } = getKey(batchTxId) || {};
  const savedTxData = getNextTxData(batchTxId);
  const { error, status: valStatus } = argumentsValidation(savedTxData, savedMetadata, args, metadata, delegation);
  if (error || valStatus) {
    updateKey(batchTxId, { delegation, metadata: savedMetadata, host, ...data });
    return res.send({ error }).status(valStatus);
  }

  const { response, status } = await query(args, delegation, host);

  return res.send(response).status(status);
}

const readStateRequest = async (req, res) => {
  const [metadata, args, batchTxId] = req.body;
  const { delegation, host } = keyStorage[batchTxId];
  if (!delegation)
    return res.send({ error: ERROR.missingDelegation }).status(400);

  const { response, status } = await readState(args, delegation, host);

  return res.send(response).status(status);
}
module.exports = { addDelegation, addBatchTransaction, callRequest, queryRequest, readStateRequest }