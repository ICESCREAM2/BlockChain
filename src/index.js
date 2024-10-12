const vorpal = require('vorpal')();
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()

vorpal
  .command('mine', 'add new blocks to the chain')
  .action(function(args, callback) {
    const newBlock = blockchain.mine()
    if(newBlock){
        console.log(newBlock)
    }
    callback();
  });

vorpal
  .command('chain', 'add new blocks to the chain')
  .action(function(args, callback) {  
    this.log(blockchain.blockchain);
    callback();
  });

// vorpal
//   .command('hello', 'greeting.')
//   .action(function(args, callback) {
//     this.log('hello blockchain');
//     callback();
//   });

  console.log('weclome to chainblock')
  vorpal.exec('help')
vorpal
  .delimiter('chian => ')
  .show();