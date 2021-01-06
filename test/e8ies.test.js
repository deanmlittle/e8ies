import { assert } from 'chai'
import { e8ies } from "../src/index.js"

let message;

describe('encrypt', () => {
    it('Creates an encrypted e8ies message', () => {
        message = e8ies.encrypt(Buffer.from("Test"), 400000, "L1r7NRuxEnJunPVLn1ZDnZxX8ERcyhRYueQrc2V5YX8TuR1GuWEi");
        console.log(message);
        assert.isNotNull(message);
    })
})

describe('decrypt', () => {
    it('Mines and decrypts an e8ies message', () => {
        const decrypted = e8ies.mine(message);
        assert.equal(decrypted.toString(), "Test");
    })
})