const keyStorage = {}

const updateKey = (key, value) => {
    keyStorage[key] = { ...keyStorage[key], ...value };
}

const removeKey = (key) => {
    delete keyStorage[key];
}

const getKey = (key) => {
    return keyStorage[key];
}

const getNextTxData = (key) => {
    const { batchTxData } = getKey(key) || {};
    const nextTxData = batchTxData?.shift();

    if (batchTxData && batchTxData.length !== 0) {
        updateKey(key, { batchTxData });
    } else if (getKey(key)) {
        removeKey(key);
    }

    return nextTxData
}

module.exports = { updateKey, removeKey, getKey, getNextTxData }