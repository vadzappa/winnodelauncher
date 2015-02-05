/**
 * Author: Vadim
 * Date: 2/5/2015
 */

var CRYPT_ENCODING = 'base64',
    CRYPT_SIZE = 128,
    crypto = require('crypto'),
    primeKeeper = crypto.createDiffieHellman(CRYPT_SIZE),
    prime = primeKeeper.getPrime(CRYPT_ENCODING),
    server = crypto.createDiffieHellman(prime, CRYPT_ENCODING),
    client = crypto.createDiffieHellman(prime, CRYPT_ENCODING);

server.generateKeys();
client.generateKeys();

console.log(prime);
console.log(server.getPublicKey(CRYPT_ENCODING));
console.log(server.getPrivateKey(CRYPT_ENCODING));
console.log(client.getPublicKey(CRYPT_ENCODING));
console.log(client.getPrivateKey(CRYPT_ENCODING));