//public and private key 
//public key as address(simplified)

let fs = require('fs')
let EC = require('elliptic').ec;

// Create and initialize EC context
// (better do it once and reuse it)
let ec = new EC('secp256k1');

// Generate keys
let keypair = ec.genKeyPair();

const keys = generateKeys()
// console.log(keys)

function getPub(prv) {
    return ec.keyFromPrivate(prv).getPublic('hex').toString()
}

function generateKeys() {
    const fileName = './wallet.json'
    try {
        let res = JSON.parse(fs.readFileSync(fileName))
        //validation
        if (res.prv && res.pub && getPub(res.prv) == res.pub) {
            keypair = ec.keyFromPrivate(res.prv)
            return res
        } else {
            throw 'not valid data in wallet.json'
        }
    } catch (error) {
        const res = {
            prv: keypair.getPrivate('hex').toString(),
            pub: keypair.getPublic('hex').toString()
        }
        fs.writeFileSync(fileName, JSON.stringify(res))
        return res
    }

}


function sign({from,to,amount,timestamp}){
    const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')
    return signature
}

function verify({from,to,amount,timestamp,signature},pub){
    const keypairTemp = ec.keyFromPublic(pub,'hex')
    const bufferMsg = Buffer.from(`${timestamp}-${amount}-${from}-${to}`)
    return keypairTemp.verify(bufferMsg,signature)
}

module.exports = {sign,verify,keys}
// const trans = {from:'me',to:'you',amount:100}
// const trans2 = {from:'me',to:'you',amount:101}
// const signature = sign(trans)
// console.log(signature)
// trans.signature = signature
// const isVerify = verify(trans,keys.pub)
// console.log(isVerify)