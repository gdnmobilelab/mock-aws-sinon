/**
 * MockAWSSinon Module
 */
const AWS = require('aws-sdk');
const sinon = require('sinon');

let cachedStubs = {}; // eslint-disable-line prefer-const, no-unused-vars

/**
 * Creates a key to use for caching the AWS stubs
 * @param {string} service - Service name
 * @param {string} method - Method name
 * @returns {string} key - Unique key from service and method names
 */
const getKey = function (service, method) { // eslint-disable-line func-names
  const key = `${service.toLowerCase()}_${method.toLowerCase()}`;
  return key;
};

/**
 * Creates a key to use for caching the AWS stubs
 * @param {string} service - Service name
 * @param {string} method - Method name
 * @returns {string} key - Unique key from service and method names
 */
const processAwsRequest = function (awsMockCallback) { // eslint-disable-line func-names
  const requestKey = getKey(this.service.serviceIdentifier, this.operation);

  if (!cachedStubs[requestKey]) {
    throw new Error(`No stub response for ${this.service.serviceIdentifier}.${this.operation}`);
  }

  let response = new AWS.Response(); // eslint-disable-line prefer-const
  response.request = this.httpRequest;

  const callback = function (err, data) { // eslint-disable-line func-names
    response.data = data;
    response.error = err;
    response.retryCount = 0;
    response.redirectCount = 0;

    awsMockCallback.call(response, response.error, response.data);
  };

  const possibleData = cachedStubs[requestKey](this.params, callback);

  if (typeof possibleData !== 'undefined') {
    callback(null, possibleData);
  }
};

/**
 * Used to initialize this module by stubbing the AWS Request send method
 */
const stubAwsRequestSend = function () { // eslint-disable-line func-names
  sinon.stub(AWS.Request.prototype, 'send').callsFake(processAwsRequest);
};

/**
 * Create an AWS mock for a service, method and callback
 * @param {string} stubKey - Key to use for cachedStubs
 * @param {string} service - AWS service name
 * @param {string} method - AWS service method name
 * @param {function} func - Callback function for mock
 */
const createAwsMock = function (stubKey, service, method, func) { // eslint-disable-line func-names
  // Initialize the stub with a temporary empty fuction
  cachedStubs[stubKey] = () => {};

  sinon.stub(cachedStubs, stubKey).callsFake(func);

  // Override the default stub restore behavior
  cachedStubs[stubKey].restore = function () { // eslint-disable-line func-names
    cachedStubs[stubKey] = null;
  };
};

/**
 * Get an AWS mock for a service and method
 * @param {string} service - AWS service name
 * @param {string} method - AWS service method name
 * @param {function} func - Callback function for mock
 * @return {Object} stub - Sinon stub for testing
 */
const getAwsMock = function (service, method, func) { // eslint-disable-line func-names
  const stubKey = getKey(service, method);

  if (!cachedStubs[stubKey]) {
    createAwsMock(stubKey, service, method, func);
  }
  const stub = cachedStubs[stubKey];

  return stub;
};

/**
 * Remove an AWS stub from the cachedStubs
 * @param {string} service - AWS service name
 * @param {string} method - AWS service method name
 */
const deleteAwsMock = function (service, method) { // eslint-disable-line func-names
  const stubKey = getKey(service, method);

  if (cachedStubs[stubKey]) {
    cachedStubs[stubKey].restore();
  }
};

/**
 * Used restore the AWS Request send method
 */
const restoreAwsRequestSend = function () { // eslint-disable-line func-names
  AWS.Request.prototype.send.restore();
};

// Initialize the library
stubAwsRequestSend();

module.exports = {
  stubAwsRequestSend,
  restoreAwsRequestSend,
  createAwsMock,
  deleteAwsMock,
  getAwsMock,
};
