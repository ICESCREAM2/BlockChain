const vorpal = require('vorpal')();
const Table = require('cli-table')
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()


function formatLog(data) {
  if (!Array.isArray(data)) {
    data = [data]
  }
  const first = data[0]
  const head = Object.keys(first)
  const table = new Table({
    head: head
  , colWidths: new Array(head.length).fill(15)
  })
  const res = data.map(v=>{
    return head.map(h=>v[h])
  })
  
  table.push(...res);
  console.log(table.toString());
}


vorpal
  .command('mine', 'add new blocks to the chain')
  .action(function (args, callback) {
    const newBlock = blockchain.mine()
    if (newBlock) {
      formatLog(newBlock)
    }
    callback();
  });

vorpal
  .command('chain', 'add new blocks to the chain')
  .action(function (args, callback) {
    formatLog(blockchain.blockchain);
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