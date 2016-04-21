var MockAWSSinon = require('../');
var AWS = require('aws-sdk');
var assert = require('assert');

describe("AWS Mock Sinon", function() {

    it("Should mock a request", function() {

        MockAWSSinon('S3', 'getObject').returns({
            what: 'yes'
        });

        new AWS.S3().getObject({
            Bucket: 'what'
        }, function(err, resp) {
            assert.equal(resp.what, 'yes');
            assert.equal(MockAWSSinon('S3', 'getObject').calledOnce, true);
        })
    })

    
})