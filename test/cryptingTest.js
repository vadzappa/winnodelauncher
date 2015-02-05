var chai = require('chai'),
    CRYPT_ENCODING = 'base64',
    CRYPT_SIZE = 128,
    crypto = require('crypto'),
    assert = chai.assert,
    should = chai.should(),
    expect = chai.expect,
    _ = require('lodash');

_.mixin(require('underscore.deferred'));

var generateServerAndClient = function () {
        var primeKeeper = crypto.createDiffieHellman(CRYPT_SIZE),
            prime = primeKeeper.getPrime(CRYPT_ENCODING);

        var server = crypto.createDiffieHellman(prime, CRYPT_ENCODING);
        server.generateKeys();

        var client = crypto.createDiffieHellman(prime, CRYPT_ENCODING);
        client.generateKeys();

        return {
            encoding: CRYPT_ENCODING,
            prime: prime,
            server: {
                public_key: server.getPublicKey(CRYPT_ENCODING),
                private_key: server.getPrivateKey(CRYPT_ENCODING)
            },
            client: {
                public_key: client.getPublicKey(CRYPT_ENCODING),
                private_key: client.getPrivateKey(CRYPT_ENCODING)
            }
        }
    },
    prepareServerAndClient = function () {
        var testData = generateServerAndClient(),
            client = crypto.createDiffieHellman(testData.prime, testData.encoding),
            server = crypto.createDiffieHellman(testData.prime, testData.encoding);

        server.setPublicKey(testData.server.public_key, testData.encoding);
        server.setPrivateKey(testData.server.private_key, testData.encoding);
        client.setPublicKey(testData.client.public_key, testData.encoding);
        client.setPrivateKey(testData.client.private_key, testData.encoding);

        return {
            client: client,
            server: server
        }

    },
    encodeMessage = function encodeMessage(password, message) {
        var cipher = crypto.createCipher('aes192', password);
        var chunk = cipher.update(message, 'utf-8', CRYPT_ENCODING);
        chunk += cipher.final(CRYPT_ENCODING);
        return chunk;
    },
    decodeMessage = function decodeMessage(password, message) {
        var decipher = crypto.createDecipher('aes192', password);
        var chunk = decipher.update(message, CRYPT_ENCODING, 'utf-8');
        chunk += decipher.final('utf-8');
        return chunk;
    };

describe('Testing Public/Private keys encoding', function () {

    describe('Generating pair of public and private key', function () {
        it('should generate keys', function (done) {
            var diffieHellman = crypto.createDiffieHellman(CRYPT_SIZE, CRYPT_ENCODING);
            var publicKey = diffieHellman.generateKeys(CRYPT_ENCODING);
            expect(publicKey).exist;
            done();
        });

        it('should have same secret', function (done) {
            var alice = crypto.getDiffieHellman('modp5');
            var bob = crypto.getDiffieHellman('modp5');

            alice.generateKeys();
            bob.generateKeys();

            var alice_secret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
            var bob_secret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

            expect(alice_secret).to.be.equal(bob_secret);
            done();
        });

        it('should have same secret (generated keys before)', function (done) {
            var testData = prepareServerAndClient(),
                client = testData.client,
                server = testData.server;

            var clientSecret = client.computeSecret(server.getPublicKey(), null, CRYPT_ENCODING);
            var serverSecret = server.computeSecret(client.getPublicKey(), null, CRYPT_ENCODING);

            console.log(testData.prime);
            console.log(testData.server);
            console.log(testData.client);

            expect(clientSecret).to.be.equal(serverSecret);
            done();
        });

        it('should exchange correct data between client and server', function (done) {
            var testData = prepareServerAndClient(),
                client = testData.client,
                server = testData.server,
                initialMessage = {
                    userName: 'mariaismyname;it should grow!_____',
                    myPublicKey: client.getPublicKey(CRYPT_ENCODING)
                };

            var clientSecret = client.computeSecret(server.getPublicKey(), null, CRYPT_ENCODING);
            var encodedMessage = encodeMessage(clientSecret, JSON.stringify(initialMessage));

            var serverSecret = server.computeSecret(client.getPublicKey(), null, CRYPT_ENCODING);
            var decodedMessage = decodeMessage(serverSecret, encodedMessage);

            expect(JSON.parse(decodedMessage)).to.be.deep.equal(initialMessage);
            done();
        });

    });
});