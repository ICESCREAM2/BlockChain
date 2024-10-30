const crypto = require('crypto')
const rsa = require('./rsa')
const dgram = require('dgram')


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
        this.peers =[]
        this.seed ={port : 8001, address : 'localhost'}
        this.remote = {}
        this.udp = dgram.createSocket('udp4')
        this.init()

        //const hash = this.computeHash(0,'0',new Date().getTime(),'HELLO WORLD',1)
        //console.log(hash)
    }
    
    // init p2p network
    init(){
        this.bindP2P()
        this.bindExit()
    }

    bindP2P(){
        this.udp.on('message',(data,remote)=>{
            const {port,address} = remote
            const action = JSON.parse(data)

            if(action.type){
                this.dispatch(action,{port,address})
            }
        })

        this.udp.on('listening',()=>{
            const address = this.udp.address()
            console.log('[DATA]: udp finished listening  The port is : '+address.port)
        })

        //dinstingush seed and node
        const port = Number(process.argv[2]) || 0   
        this.startNode(port)

    }

    bindExit(){
        process.on('exit',()=>{
            console.log('[DATA]: GOOD BYE')
        })
    }

    startNode(port){
        this.udp.bind(port)
        // not seednode, send message to seed node 
        if(port !== 8001){
            this.send({
                type:'newpeer'  
            },this.seed.port,this.seed.address)
        this.peers.push(this.seed)
        }
    }

    send(message,port,address){
        this.udp.send(JSON.stringify(message),port,address)
    }

    boardcast(action){
        this.peers.forEach(v=>{
            this.send(action,v.port,v.address)
        })
    }
    dispatch(action,remote){
        console.log('Receive message from p2p network',action)
        switch(action.type){
            case 'newpeer':
                //what the seed do
                //1.get public ip and port
                //2.get list of all nodes
                //3.broadcast
                this.send({
                    type:'remoteAddress',
                    data: remote
                },remote.port,remote.address)
                this.send({
                    type:'peerlist',
                    data:this.peers
                },remote.port,remote.address)

                this.boardcast({
                    type:'sayHi',
                    data:remote
                })
                this.peers.push(remote)
                console.log('Hello New Friend',remote)
                break
            
            case 'remoteAddress':
                this.remote = action.data
                break 
            
            case 'peerlist':
                const newPeers = action.data
                this.addPeers(newPeers)
                break
            
            case 'sayHi':
                let remotePeer = action.data
                this.peers.push(remotePeer)
                console.log('Hi, great to meet you',remotePeer.port,remotePeer.address)
                this.send({type:'hi' ,data:'hi'},remotePeer.port,remotePeer.address)
                break
            
            case 'hi':
                console.log(`${remote.address}:${remote.port} :${action.data}`)
                break

            default:
                console.log('unknown action')
        }
    }

    isEqualPeer(peer1,peer2){
        return peer1.address == peer2.address && peer1.port == peer2.port
    }

    addPeers(peers){
        peers.forEach(peer=>{
            if(!this.peers.find(v=>this.isEqualPeer(peer,v))){
                this.peers.push(peer)
            }
        })
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
        
        const sig = rsa.sign({from,to,amount})
        const sigTrans = {from,to,amount,sig}
        this.data.push(sigTrans)
        return sigTrans
    }

    isValidTransfer(trans){
        //public key is same as address
        return rsa.verify(trans,trans.from)
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
        //valid all the transactions
        if(!this.data.every(v=>this.isValidTransfer(v))){
            console.log('trans not valid')
        }
        
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
