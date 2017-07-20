/**
 * MockAWSSinon Module
 */
const AWS = require('aws-sdk');
const sinon = require('sinon');

this.cachedStubs = {}; // eslint-disable-line prefer-const

/**
 * Creates a key to use for caching the AWS stubs
 * @param {string} service - Service name
 * @param {string} method - Method name
 * @returns {string} key - Unique key from service and method names
 */
const getKey = (service, method) => {
  const key = `${service.toLowerCase()}_${method.toLowerCase()}`;
  return key;
};

/**
 * Creates a key to use for caching the AWS stubs
 * @param {string} service - Service name
 * @param {string} method - Method name
 * @returns {string} key - Unique key from service and method names
 */
const processAwsRequest = (awsMockCallback) => {
  console.log('service', this.service);
  console.log('operation', this.operation);
  const requestKey = getKey(this.service.serviceIdentifier, this.operation);

  if (!this.cachedStubs[requestKey]) {
    throw new Error(`No stub response for ${this.service.serviceIdentifier}.${this.operation}`);
  }

  let response = new AWS.Response(); // eslint-disable-line prefer-const
  response.request = this.httpRequest;

  const callback = (err, data) => {
    response.data = data;
    response.error = err;
    response.retryCount = 0;
    response.redirectCount = 0;

    awsMockCallback.call(response, response.error, response.data);
  };

  const possibleData = this.cachedStubs[requestKey](this.params, callback);

  if (typeof possibleData !== 'undefined') {
    callback(null, possibleData);
  }
};

/**
 * Used to initialize this module by stubbing the AWS Request send method
 */
const stubAwsRequestSend = () => {
  sinon.stub(AWS.Request.prototype, 'send').callsFake(processAwsRequest);
};

/**
 * Create an AWS mock for a service, method and callback
 * @param {string} stubKey - Key to use for cachedStubs
 * @param {string} service - AWS service name
 * @param {string} method - AWS service method name
 * @param {function} func - Callback function for mock
 */
const createAwsMock = (stubKey, service, method, func) => {
  // Initialize the stub with a temporary empty fuction
  this.cachedStubs[stubKey] = () => {};

  sinon.stub(this.cachedStubs, stubKey).callsFake(func);

  // Override the default stub restore behavior
  this.cachedStubs[stubKey].restore = () => {
    this.cachedStubs[stubKey] = null;
  };
};

/**
 * Get an AWS mock for a service and method
 * @param {string} service - AWS service name
 * @param {string} method - AWS service method name
 * @param {function} func - Callback function for mock
 * @return {Object} stub - Sinon stub for testing
 */
const getAwsMock = (service, method, func) => {
  const stubKey = getKey(service, method);

  if (!this.cachedStubs[stubKey]) {
    createAwsMock(stubKey, service, method, func);
  }
  const stub = this.cachedStubs[stubKey];

  return stub;
};

/**
 * Used restore the AWS Request send method
 */
const restoreAwsRequestSend = () => {
  AWS.Request.prototype.send.restore();
};

// Initialize the library
stubAwsRequestSend();

module.exports = {
  stubAwsRequestSend,
  restoreAwsRequestSend,
  createAwsMock,
  getAwsMock,
};
