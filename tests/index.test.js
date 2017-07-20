/**
 * MockAWSSinon Module tests
 */
const mockAwsSinon = require('../index');
const AWS = require('aws-sdk');
const assert = require('assert');

describe('AWS Mock Sinon', () => {
  it('Should mock a request', (done) => {
    mockAwsSinon.getAwsMock('S3', 'getObject', () => {
      return {
        what: 'yes',
      }
    });

    new AWS.S3().getObject({
      Bucket: 'what',
    },
    (err, resp) => {
      assert.equal(resp.what, 'yes');
      assert.equal(mockAwsSinon.getAwsMock('S3', 'getObject').calledOnce, true);
      done();
    });
  });

  it('Should allow you to use a function that returns immediately', (done) => {
    mockAwsSinon.getAwsMock('S3', 'putObject', (params, cb) => { // eslint-disable-line no-unused-vars
      const reply = 'hello';
      return reply;
    });

    new AWS.S3().putObject({
      test: 'test',
    },
    (err, resp) => {
      assert.equal(resp, 'hello');
      done();
    });
  });

  it('Should allow you to use a function that uses a callback', (done) => {
    mockAwsSinon.getAwsMock('S3', 'putObject', (params, cb) => {
      cb(null, 'hello');
    });

    new AWS.S3().putObject({
      test: 'test',
    },
    (err, resp) => {
      assert.equal(resp, 'hello');
      done();
    });
  });
});
