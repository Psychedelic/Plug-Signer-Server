const { HttpAgent } = require('@dfinity/agent');
const { Principal } = require('@dfinity/principal');
const fetch = require('cross-fetch');

const { arrayBufferToBase64, base64ToBuffer } = require('./index');

const call = async (args, delegation, host) => {
  try {
    const agent = new HttpAgent({ identity: delegation, fetch, host });
    const response = await agent.call(Principal.fromText(args.canisterId), { methodName: args.methodName, arg: base64ToBuffer(args.arg) });

    return {
      response: {
        result: {
          ...response,
          requestId: arrayBufferToBase64(response.requestId),
        },
      },
      status: 200,
    };
  } catch (error) {
    return { response: { error: error.message }, status: 500 };
  }
}

const query = async (args, delegation, host) => {
  try {
    const agent = new HttpAgent({ identity: delegation, fetch, host });
    const response = await agent.query(args.canisterId, { methodName: args.methodName, arg: base64ToBuffer(args.arg) });
    if (response.reply) {
      response.reply.arg = arrayBufferToBase64(
        response.reply.arg
      );
    }

    return {
      response: {
        result: response,
      },
      status: 200
    }
  } catch (error) {
    return { response: { error }, status: 500 };
  }
}

const readState = async (args, delegation, host) => {
  const { canisterId, paths } = args;
  try {
    const agent = new HttpAgent({ identity: delegation, fetch, host });
    const response = await agent.readState(canisterId, {
      paths: [paths.map(path => base64ToBuffer(path))],
    });

    return res.send({
      result: {
        certificate: arrayBufferToBase64(response.certificate),
      }
    }).status(200);
  } catch (error) {
    return res.send({ error }).status(500);
  }
}

module.exports = { call, query, readState }