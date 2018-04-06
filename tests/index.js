var MockAWSSinon = require('../');
var AWS = require('aws-sdk');
var assert = require('assert');

describe("AWS Mock Sinon", function() {

    afterEach(() => {
        MockAWSSinon.restore();
    });

    it("Should mock a request", function(done) {
        MockAWSSinon('S3', 'getObject').returns({
            what: 'yes'
        });

        new AWS.S3().getObject({
            Bucket: 'what'
        }, function(err, resp) {
            assert.equal(resp.what, 'yes');
            assert.equal(MockAWSSinon('S3', 'getObject').calledOnce, true);
            done();
        })
    });
    it("Should work with promises", async function() {
        MockAWSSinon('S3', 'getObject').returns({
            what: 'yes'
        });
        var resp = await new AWS.S3().getObject({
            Bucket: 'what'
        }).promise();

        assert.equal(resp.what, 'yes');
        assert.equal(MockAWSSinon('S3', 'getObject').calledOnce, true);
    });

    it("Should allow you to use a function that returns immediately", function(done) {
        MockAWSSinon('S3', 'putObject', function(params, cb) {
            return "hello"
        })

        new AWS.S3().putObject({
            test: 'test'
        }, function(err, resp) {
            assert.equal(resp, "hello");
            done();
        })
    })

     it("Should allow you to use a function that uses a callback", function() {
        MockAWSSinon('S3', 'putObject', function(params, cb) {
            cb(null, "hello")
        })

        new AWS.S3().putObject({
            test: 'test'
        }, function(err, resp) {
            assert.equal(resp, "hello");
        })
    })
    
    it("Should allow you to easily override a stub", function(done) {
        MockAWSSinon('S3', 'putObject', function(params, cb) {
            return "hello"
        })

        MockAWSSinon('S3', 'putObject', function(params, cb) {
            return "world"
        })

        new AWS.S3().putObject({
            test: 'test'
        }, function(err, resp) {
            assert.equal(resp, "world");
            assert.equal(MockAWSSinon('S3', 'putObject').calledOnce, true);
            done();
        })
    })

    it("Should allow multiple teardowns and setups", function(done) {
        MockAWSSinon('S3', 'putObject', function(params, cb) {
            return "hello"
        })

        MockAWSSinon.restore();

        MockAWSSinon('S3', 'putObject', function(params, cb) {
            return "world"
        })

        new AWS.S3().putObject({
            test: 'test'
        }, function(err, resp) {
            assert.equal(resp, "world");
            assert.equal(MockAWSSinon('S3', 'putObject').calledOnce, true);            
            done();
        })
    })

    it("Let's you call restore before setting anything", function() {
        MockAWSSinon.restore();
    });
})