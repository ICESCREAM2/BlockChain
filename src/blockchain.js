const crypto = require('crypto')

const initBlock = {
    index: 0,
    data :'HELLO WORLD',
    prevHash : '0',
    timestamp : 1728595072246,
    nonce : 50466,
    hash : 'b80c3a3cb715e3bebdefa5944a015ad7ed80c7d4e2eed318d294b87b1ef66bff'
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

    transfer(from,to,amount){
        //signature validation(finished)
        if(from != '0'){
            if(this.balance(from) < amount){
                console.log('not enough balance',from,to,amount)
                return
            }
        }
        const transObj ={from,to,amount}
        this.data.push(transObj)
        return transObj
    }

    balance(address){
        let balance = 0
        this.blockchain.forEach(block=>{
            if(!Array.isArray(block.data)){
                //filter initblock
                return
            }
            block.data.forEach(trans =>{
                if(trans.from == address){
                    balance -= trans.amount
                }
                if(trans.to == address){
                    balance += trans.amount
                }
            })
        })
        if(!balance){
            console.log('no this user',address)
                return
        }
        return balance
    }
    

    //Pack Transactions into a block
    mine(address){
        //miner get awards after minecraft 
        this.transfer('0', address, 100)
        const newBlock = this.generateNewBlock()
        //console.log(this.isValidBlock(newBlock))
        if(this.isValidBlock(newBlock) && this.isValidChain()){
            this.blockchain.push(newBlock)
            this.data = []
            return newBlock
        }else{
            console.log("Error! Invaild Block",newBlock)
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
            hash = this.computeHash(index,data,prevHash,timestamp,nonce)
            //console.log(nonce,hash)
        }while(hash.slice(0,this.difficulty) != '0'.repeat(this.difficulty))
        
       return{
            index,
            data,
            prevHash,
            timestamp,
            nonce,
            hash
        }
    }

    computeHashForBlock({index,data,prevHash,timestamp,nonce}){
        return this.computeHash(index,data,prevHash,timestamp,nonce)
    }

    computeHash(index,data,prevHash,timestamp,nonce){
        return crypto
                    .createHash('sha256')
                    .update(index+prevHash+timestamp+data+nonce)
                    .digest('hex')
                      
    }

    

    isValidBlock(newBlock,lastBlock = this.getLastBlock()){
        if(newBlock.index !== lastBlock.index + 1){
            return false
        }else if(newBlock.timestamp <= lastBlock.timestamp){
            return false
        }else if(newBlock.prevHash !== lastBlock.hash){
            return false
        }else if(newBlock.hash.slice(0,this.difficulty)!=='0'.repeat(this.difficulty)){
            return false
        }else if(this.computeHashForBlock(newBlock) !== newBlock.hash){
            // console.log(this.computeHashForBlock(newBlock))
            // console.log(newBlock.hash)
            return false
        }
        return true

    }

    isValidChain(chain = this.blockchain){
        for(let i = chain.length - 1; i >= 1 ; i--){
            //validate all blocks except initBlock
            if(!this.isValidBlock(chain[i],chain[i-1])){
                return false
            }
        }
        //validate initBlock
        if(JSON.stringify(chain[0])!==JSON.stringify(initBlock)){
            return false
        }
        return true
    }

}

// let bc = new Blockchain()
// bc.mine()
// bc.mine()
// bc.mine()
// bc.blockchain[1].nonce = 2
// bc.mine()
// console.log(bc.blockchain)

module.exports = Blockchain
