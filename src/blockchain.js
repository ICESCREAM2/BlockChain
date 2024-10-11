const crypto = require('crypto')

const initBlock = {
    index: 0,
    data :'HELLO WORLD',
    prevHash : '0',
    timestamp : 1728595072246,
    hash : '003c1526f59cd54b1646e32b2e2a46d72725807027df0ab5b0bc5f45f3debf1c'
}

class Blockchain{
    constructor(){
        this.blockchain = [initBlock]
        this.data = []
        this.difficulty = 2
        //const hash = this.computeHash(0,'0',new Date().getTime(),'HELLO WORLD',1)
        //console.log(hash)
    }

    getLastBlock(){
        return this.blockchain.at(-1)
    }

    mine(){
        const newBlock = this.generateNewBlock()
        if(this.isValidBlock(newBlock)){
            this.blockchain.push(newBlock)
        }else{
            console.log("Error! Invaild Block")
        }
       
    }

    generateNewBlock(){
        //1. generate new blcok
        let nonce = 0
        const index = this.blockchain.length
        const data = this.data
        const prevHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash
        //2. calculate hash until a value less than or equal to the condition is met.
        do{
            nonce++
            hash = this.computeHash(index,prevHash,timestamp,data,nonce)
            //console.log(nonce,hash)
        }while(hash.slice(0,this.difficulty) != '0'.repeat(this.difficulty))
        
       return{
            index,
            data,
            prevHash,
            timestamp,
            hash
        }
    }

    computeHash(index,prevHash,timestamp,data,nonce){
        return crypto
                    .createHash('sha256')
                    .update(index+prevHash+timestamp+data+nonce)
                    .digest('hex')
                      
    }

    isValidBlock(newBlock){
        const lastBlock = this.getLastBlock()
        if(newBlock.index !== lastBlock.index + 1){
            return false
        }else if(newBlock.timestamp <= lastBlock.timestamp){
            return false
        }else if(newBlock.prevHash !== lastBlock.hash){
            return false
        }else if(newBlock.hash.slice(0,this.difficulty)!=='0'.repeat(this.difficulty)){
            return false
        }
        return true

    }

}

let bc = new Blockchain()
bc.mine()
//bc.mine()
console.log(bc.blockchain)
