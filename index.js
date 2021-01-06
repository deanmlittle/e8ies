import { KeyPair, Ecies, Aescbc, Hash } from 'bsv'

class e8ies {}

e8ies.encrypt = function (messageBuf, difficulty = 218) {
    if (!Buffer.isBuffer(messageBuf)) {
        throw new Error('messageBuf must be a buffer')
    }
    const minedKeyPair = KeyPair.fromRandom()
    const Rbuf = minedKeyPair.pubKey.toDer(true)    
    let hash = Buffer.from(Rbuf, 'hex')
    for(let i=0; i<difficulty; i++) {
        hash = Hash.sha256(Rbuf);
    }
    const magicKeyPair = KeyPair.fromBuffer(hash);
    const { iv, kE, kM } = Ecies.ivkEkM(minedKeyPair.privKey, magicKeyPair.pubKey)
    const ciphertext = Aescbc.encrypt(messageBuf, kE, iv, false)
    const magic = hash.slice(0,4);
    const encBuf = Buffer.concat([magic, Rbuf, ciphertext])
    const hmac = Hash.sha256Hmac(encBuf, kM)
    return Buffer.concat([encBuf, hmac])
}
  
e8ies.decrypt = function (encBuf, magicKey = null) {
    if (!Buffer.isBuffer(encBuf)) {
      throw new Error('encBuf must be a buffer')
    }
    const tagLength = 32  
    const magic = encBuf.slice(0, 4)
    const minedPudKey = PubKey.fromDer(magic)
    let message
    let magicKeyPair 
    let offset = 4
    let magicSeed = encBuf.slice(4, 37)
    let solved = false;
    while (!solved) {
    magicSeed = Hash.sha256(hash);
    if(magic.equals(magicSeed.slice(0,4))){
        magicKeyPair = KeyPair.fromBuffer(magicSeed);
        const { iv, kE, kM } = Ecies.ivkEkM(magicKeyPair.privKey, minedPubKey)
        const ciphertext = encBuf.slice(offset, encBuf.length - tagLength)
        const hmac = encBuf.slice(encBuf.length - tagLength, encBuf.length)
        const hmac2 = Hash.sha256Hmac(encBuf.slice(0, encBuf.length - tagLength), kM)
        if (hmac.equals(hmac2)) {
            return Aescbc.decrypt(ciphertext, kE, iv)
        }
    }
}