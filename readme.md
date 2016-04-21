# mock-aws-sinon

A quick and simple library that lets you use [Sinon](http://sinonjs.org) stubs with [aws-sdk](https://aws.amazon.com/sdk-for-node-js/).

### Why is this needed?

aws-sdk creates services in a weird way, so it isn't possible to do, say:

    sinon.stub(AWS.S3.prototype, "getObject").returns({
       an: "object"
    })
    
Because `AWS.S3.prototype` doesn't actually have a function called getObject. It is possible
to just stub an instance of `new AWS.S3`, but chances are you instantiating that in your non-test
code, and don't want to structure it weirdly just so that you can run tests properly.

### How do I use it?

Rather than call `sinon.stub`, you can call this module as a function, which will return a stub. Like so:

    var mockAWSSinon = require('mock-aws-sinon');
    
    mockAWSSinon('S3','getObject').returns({
        an: 'object'
    });
    
    new AWS.S3().getObject({Bucket: 'test'}, function(err, response) {
        assert.equal(response.an, 'object') // true
    })
    
If you wish to use the sinon vertification helpers, you can get run the function again to retrieve the same
stub. So instead of doing:

    AWS.S3.prototype.getObject.calledOnce()

you write:

    mockAWSSinon('S3','getObject').calledOnce()
    
### How does it actually work?

It stubs out AWS.Request.send, which *is* available. That stub then returns a mock AWS.Response object with the return value you have provided. This idea was copied from [fakeaws](https://github.com/k-kinzal/fakemock), which works great except that I couldn't find a way to call verification methods on stubbed code, which this allows you to do.
    
