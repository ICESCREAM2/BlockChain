const crypto = require('crypto')

const initBlock = {
    index: 0,
    data :'HELLO WORLD',
    preHash : '0',
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
        //1. generate new blcok
        let nonce = 0
        const index = this.blockchain.length
        const data = this.data
        const preHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash
        //2. calculate hash until a value less than or equal to the condition is met.
        do{
            nonce++
            hash = this.computeHash(index,preHash,timestamp,data,nonce)
            //console.log(nonce,hash)
        }while(hash.slice(0,this.difficulty) != '0'.repeat(this.difficulty))
        
        /*console.log("mine over",{
            index,
            data,
            preHash,
            timestamp,
            hash
        })*/
        this.generateNewBlock(index,data,preHash,timestamp,hash)
    }

    generateNewBlock(index,data,preHash,timestamp,hash){
        this.blockchain.push({index,
            data,
            preHash,
            timestamp,
            hash
        })
    }

    computeHash(index,preHash,timestamp,data,nonce){
        return crypto
                    .createHash('sha256')
                    .update(index+preHash+timestamp+data+nonce)
                    .digest('hex')
                      
    }

    isValidBlock(){
        

    }

    listBlock(){
        this.blockchain.forEach((value) =>{
            console.log(value)
        })
    }
}

let bc = new Blockchain()
bc.mine()
bc.listBlock()
bc.mine()
bc.listBlock()
