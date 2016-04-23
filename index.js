var AWS = require('aws-sdk');
var sinon = require('sinon');

var cachedStubs = {};
var getKey = function(service, method) {

    // We need to store our stubs by key, so we use this to calculate one
    // based on the service and method being called. The API uses uppercase
    // for services, while the request does not - setting both to lowercase
    // to remove any confusion from that

    return service.toLowerCase() + '_' + method.toLowerCase();
};

var processRequest = function(cb) {

    var requestKey = getKey(this.service.serviceIdentifier, this.operation);

    if (!cachedStubs[requestKey]) {

        // If we don't have a cached stub we throw an error. Future improvement
        // will be to provide option to continue running the request as it would have
        // otherwise, but 99% of the time you don't want that - we're testing!

        throw new Error("No stub response for " + this.service.serviceIdentifier + '.' + this.operation);
    }

    var response = new AWS.Response();
    response.request = this.httpRequest;

    var callback = function(err, data) {
        response.data = data;
        response.error = err;
        response.retryCount = 0;
        response.redirectCount = 0;

        cb.call(response, response.error, response.data);
    }


    var possibleData = cachedStubs[requestKey](this.params, callback);
    if (typeof possibleData !== 'undefined') {
        callback(null, possibleData);
    }

    
};

// The first time we stub something we actually stub the AWS.Request.send()
// method, which is about the only way we can effectively stub methods.

var stubbedRequestSend = false;
var stubRequestSend = function() {
    
    if (stubbedRequestSend === true) {
        return;
    }

    sinon.stub(AWS.Request.prototype, "send", processRequest);
    stubbedRequestSend = true;
}

module.exports = function(service, method, func) {

    stubRequestSend();
    
    var stubKey = getKey(service, method);

    if (!cachedStubs[stubKey]) {
        
        cachedStubs[stubKey] = function() {} // is never run

        sinon.stub(cachedStubs, stubKey, func);

        cachedStubs[stubKey].restore = function() {
            // override default stub behaviour here to account for our
            // custom weirdness.

            cachedStubs[stubKey] = null;
        }
    }

    return cachedStubs[stubKey];

}

module.exports.restore = function() {
    AWS.Request.prototype.restore();
}
