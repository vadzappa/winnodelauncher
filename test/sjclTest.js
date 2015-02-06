/**
 * Created by Vadim on 2/6/2015.
 */
var chai = require('chai'),
    assert = chai.assert,
    should = chai.should(),
    expect = chai.expect,
    _ = require('lodash'),
    sjcl = require('sjcl'),
    base64 = require('../application/modules/base64'),
    password = 'wfF9cjDrZ4s43dtT8GMWn9Y3y3483Z8Z';

_.mixin(require('underscore.deferred'));

describe('SJCL Testing', function () {

    describe('Encrypt/decrypt tests', function () {
        it('encrypt/decrypt', function (done) {
            var messageToEncode = {
                    name: 'user'
                },
                encryptedDetails = sjcl.encrypt(password, JSON.stringify(messageToEncode)),
                base64encoded = base64.encode(encryptedDetails);

            var base64decoded = base64.decode(base64encoded),
                decryptedDetails = sjcl.decrypt(password, base64decoded),
                finalMessage = JSON.parse(decryptedDetails);

            expect(finalMessage).to.be.deep.equal(messageToEncode);
            done();
        });

    });
});