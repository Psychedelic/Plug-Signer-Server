const { Ed25519KeyIdentity } = require('@dfinity/identity');

const ERROR = require('./error')

const createEphimeralKey = () => {
  return Ed25519KeyIdentity.generate();
}

const createDelegationIdentity = (identity, delegationChainJSON) => {
  const delegationChain = DelegationChain.fromJSON(delegationChainJSON);
  return DelegationIdentity.fromDelegation(identity, delegationChain);
}

const argumentsValidation = (batchTxId, args, delegation, batchData, metadata) => {
  if (!delegation)
    return { error: ERROR.missingDelegation, status: 400 };
  if (!validateTxData(batchData, args))
    return { error: ERROR.invalidTxData, status: 401 };
  if (!validateMetadata(batchData.metadat, metadata))
    return { error: ERROR.invalidMetadata, status: 401 };
  return {};
}

const validateMetadata = (savedMetadata, metadata) => {
  console.log('metadata', metadata);
  console.log('savedMetadata', savedMetadata);
  return savedMetadata === metadata;
}

const validateTxData = (savedData, request) => {
  if (
    !savedData ||
    savedData.canisterId !== request.canisterId ||
    savedData.methodName !== request.methodName
  ) {
    // if you dont have savedTxInfo
    // or the methodName or cannotisterId is different from the savedTxInfo
    // the batch tx is not valid
    return false;
  }

  if (savedData.args) {
    // if there is args saved in the savedTxInfo
    // coming args must be the same as the saved args
    // args and savedTxInfo.args gonna be base64 encoded
    return savedData.args === request.arg;
  }

  return true;
}


const bufferToBase64 = (buf) => {
  return Buffer.from(buf.buffer).toString('base64');
}

const base64ToBuffer = (base64) => {
  return Buffer.from(base64, 'base64');
}


module.exports = { createEphimeralKey, createDelegationIdentity, validateTxData, argumentsValidation, bufferToBase64, base64ToBuffer };
