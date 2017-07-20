/**
 * MockAWSSinon Module
 */
const AWS = require('aws-sdk');
const sinon = require('sinon');

let cachedStubs = {}; // eslint-disable-line prefer-const
const getKey = (service, method) => {
  // We need to store our stubs by key, so we use this to calculate one
  // based on the service and method being called. The API uses uppercase
  // for services, while the request does not - setting both to lowercase
  // to remove any confusion from that
  const key = `${service.toLowerCase()}_${method.toLowerCase()}`;
  return key;
};

const processRequest = (cb) => {
  const requestKey = getKey(this.service.serviceIdentifier, this.operation);

  if (!cachedStubs[requestKey]) {
    // If we don't have a cached stub we throw an error. Future improvement
    // will be to provide option to continue running the request as it would have
    // otherwise, but 99% of the time you don't want that - we're testing!
    throw new Error(`No stub response for ${this.service.serviceIdentifier}.${this.operation}`);
  }

  let response = new AWS.Response(); // eslint-disable-line prefer-const
  response.request = this.httpRequest;

  const callback = (err, data) => {
    response.data = data;
    response.error = err;
    response.retryCount = 0;
    response.redirectCount = 0;

    cb.call(response, response.error, response.data);
  };

  const possibleData = cachedStubs[requestKey](this.params, callback);

  if (typeof possibleData !== 'undefined') {
    callback(null, possibleData);
  }
};

// The first time we stub something we actually stub the AWS.Request.send()
// method, which is about the only way we can effectively stub methods.
let stubbedRequestSend = false;

const stubRequestSend = () => {
  if (stubbedRequestSend === true) {
    return;
  }

  sinon.stub(AWS.Request.prototype, 'send').callsFake(processRequest);
  stubbedRequestSend = true;
};

/**
 *
 */
module.exports = (service, method, func) => {
  stubRequestSend();
  const stubKey = getKey(service, method);

  if (!cachedStubs[stubKey]) {
    cachedStubs[stubKey] = () => {}; // is never run

    sinon.stub(cachedStubs, stubKey).callsFake(func);

    cachedStubs[stubKey].restore = () => {
      // override default stub behaviour here to account for our
      // custom weirdness.
      cachedStubs[stubKey] = null;
    };
  }

  return cachedStubs[stubKey];
};

// /**
//  *
//  */
// const awsRestore = () => {
//   AWS.Request.prototype.send.restore();
// };
//
// module.exports = {
//   awsRestore,
//   mockAwsServiceMethod,
// };
