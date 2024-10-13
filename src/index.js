const vorpal = require('vorpal')();
const Table = require('cli-table')
const Blockchain = require('./blockchain')
const blockchain = new Blockchain()


function formatLog(data) {
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
  .command('trans <from> <to> <amount>', 'transaction')
  .action(function (args, callback) {
    let trans = blockchain.transfer(args.from, args.to, args.amount)
    formatLog(trans)
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
  .command('mine <address>', 'pack new transactions')
  .action(function (args, callback) {
    const newBlock = blockchain.mine(args.address)
    if (newBlock) {
      formatLog(newBlock)
    }
    callback();
  });

vorpal
  .command('chain', 'display blockchain')
  .action(function (args, callback) {
    formatLog(blockchain.blockchain);
    callback();
  });


console.log('weclome to chainblock')
vorpal.exec('help')
vorpal
  .delimiter('chian => ')
  .show();