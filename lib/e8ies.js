/**
 * e8ies.js - v1.0.1
 * A 21e8 ECIES library
 * https://github.com/deanmlittle/e8ies
 * Copyright © 2021 Dean Little.
 */

var e8ies = (function (exports, bsv) {
  'use strict';

  /**
   * e8ies
   * ============
   *
   * Mine 21e8, or don't, whatever.
   */

  class e8ies {}

  e8ies.encrypt = (messageBuf, difficulty = 218, fromKey = null) => {
    if (!Buffer.isBuffer(messageBuf)) {
      throw new Error('messageBuf must be a buffer');
    }

    let minedKeyPair;

    if (fromKey) {
      minedKeyPair = bsv.KeyPair.fromPrivKey(bsv.PrivKey.fromString(fromKey));
    } else {
      minedKeyPair = bsv.KeyPair.fromRandom();
    }

    const Rbuf = minedKeyPair.pubKey.toDer(true);
    let hash = Buffer.from(Rbuf, 'hex');
    console.log(hash);

    for (let i = 0; i < difficulty; i++) {
      hash = bsv.Hash.sha256(hash);
    }

    const magicKeyPair = bsv.KeyPair.fromPrivKey(new bsv.PrivKey(bsv.Bn.fromBuffer(hash)));
    const {
      iv,
      kE,
      kM
    } = bsv.Ecies.ivkEkM(minedKeyPair.privKey, magicKeyPair.pubKey);
    const ciphertext = bsv.Aescbc.encrypt(messageBuf, kE, iv, false);
    const magic = hash.slice(0, 4);
    const encBuf = Buffer.concat([magic, Rbuf, ciphertext]);
    const hmac = bsv.Hash.sha256Hmac(encBuf, kM);
    return Buffer.concat([encBuf, hmac]);
  };

  e8ies.mine = encBuf => {
    if (!Buffer.isBuffer(encBuf)) {
      throw new Error('encBuf must be a buffer');
    }

    const magic = encBuf.slice(0, 4);
    let message = false;
    let magicSeed = encBuf.slice(4, 37);
    const minedPubKey = bsv.PubKey.fromDer(magicSeed);

    while (!message) {
      magicSeed = bsv.Hash.sha256(magicSeed);

      if (magic.equals(magicSeed.slice(0, 4))) {
        const magicKey = new bsv.PrivKey(bsv.Bn.fromBuffer(magicSeed));
        message = e8ies.decrypt(encBuf, magicKey, minedPubKey);
      }
    }

    return message;
  };

  e8ies.decrypt = (encBuf, magicKey, minedPubKey) => {
    if (!Buffer.isBuffer(encBuf)) {
      throw new Error('encBuf must be a buffer');
    }

    const tagLength = 32;
    let offset = 37;
    const {
      iv,
      kE,
      kM
    } = bsv.Ecies.ivkEkM(magicKey, minedPubKey);
    const ciphertext = encBuf.slice(offset, encBuf.length - tagLength);
    const hmac = encBuf.slice(encBuf.length - tagLength, encBuf.length);
    const hmac2 = bsv.Hash.sha256Hmac(encBuf.slice(0, encBuf.length - tagLength), kM);

    if (!hmac.equals(hmac2)) {
      return false;
    }

    return bsv.Aescbc.decrypt(ciphertext, kE, iv);
  };

  exports.e8ies = e8ies;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}, bsvjs));
