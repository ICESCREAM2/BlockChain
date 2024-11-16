const vorpal = require('vorpal')();
const Table = require('cli-table')
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()
const rsa = require('./rsa')


function formatLog(data) {
  if(!data || data.length ==0){
    return
  }
  if (!Array.isArray(data)) {
    data = [data]
  }
  const first = data[0]
  // get keys like index hash
  const head = Object.keys(first)
  const table = new Table({
    head: head
  , colWidths: new Array(head.length).fill(15)
  })
  //Access data using a key
  const res = data.map(v=> head.map(h=>JSON.stringify(v[h],null,2)))
  
  table.push(...res);
  console.log(table.toString());
}

vorpal
  .command('trans <to> <amount>', 'transaction')
  .action(function (args, callback) {
    let trans = blockchain.transfer(rsa.keys.pub, args.to, args.amount)
    if(trans){
      formatLog(trans)
    }
    callback();
  });

vorpal
  .command('balance <address>', 'check balance')
  .action(function (args, callback) {
    const balance = blockchain.balance(args.address)
    if(balance){
      formatLog({address:args.address,balance})
    }
    callback();
  });

vorpal
  .command('detail <index>', 'fetch blockchain details by index')
  .action(function (args, callback) {
    const block = blockchain.blockchain[args.index]
    this.log(JSON.stringify(block, null, 2))
    callback();
  });

vorpal
  .command('mine', 'pack new transactions')
  .action(function (args, callback) {
    const newBlock = blockchain.mine(rsa.keys.pub)
    if (newBlock) {
      formatLog(newBlock)
    }
    callback();
  });


  vorpal
  .command('blockchain', 'display blockchain')
  .action(function (args, callback) {
    formatLog(blockchain.blockchain);
    callback();
  });

  vorpal
  .command('pub', 'display public address')
  .action(function (args, callback) {
    console.log(rsa.keys.pub);
    callback();
  });

  vorpal
  .command('peers', 'check network node list')
  .action(function (args, callback) {
    formatLog(blockchain.peers)
    callback();
  });


  vorpal
  .command('chat <msg>', 'say Hi to the network')
  .action(function (args, callback) {
    blockchain.broadcast({
      type:'hi',
      data: args.msg
    })
    callback();
  });

  vorpal
  .command('pending', 'view unpackaged transactions')
  .action(function (args, callback) {
    formatLog(blockchain.data)
    callback();
  });


console.log('weclome to chainblock')
vorpal.exec('help')
vorpal
  .delimiter('chian => ')
  .show();