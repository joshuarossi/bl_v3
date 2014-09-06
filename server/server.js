/**
 * Created by josh on 9/4/14.
 */

// This function will be used anywhere we need to generate a bitcoin address for use in our system
// Right now, it is using blockchain.info's API, but I am designing it so that any other service
// could be dropped in here.
// We could also set up a separate server to handle all bitcoin transactions and hold passwords, etc.
var time = (new Date).toTimeString();
var profile = {
    'jackpot': 0,
    'total_balance': 0,
    'time': time
};
try {
    Accounts.createUser(
        {
            username: 'blottery',
            profile: profile
        }
    );
}
catch (e){

}


console.log(Meteor.users.findOne({username: 'blottery'}));


var Transactions = new Mongo.Collection('transactions');
var Internal_Addresses = new Mongo.Collection('internal_addresses');

var list_of_addresses = Internal_Addresses.find().map(function (each){return each.address});
console.log(list_of_addresses);

var addresses = Internal_Addresses.find({}, {address: 1, _id: 0});
var guid = '4ea165f1-697a-4113-9ce2-6d4f607f73cf';
var password = 'josh03211982';

var WebSocket = Meteor.npmRequire('ws');
var ws = new WebSocket('ws://ws.blockchain.info/inv');


function setBalance(address) {
    var balance = getBalance(address);
    balance = Math.floor(balance *.75);
    Meteor.users.update({'profile.internal_address': address}, {$set: {'profile.balance': balance}});
    console.log('set balance for ' + address + ' to ' + balance);
}

function handleInputs(tx) {
    try {
        tx.x.inputs.forEach(function (entry) {
            var input = Object();
            input.address = entry.prev_out.addr;
            input.value = entry.prev_out.value;
            Meteor.users.update(
                {'profile.internal_address': input.address},
                {$inc: {'profile.balance': -input.value}}, upsert = false);
        });
    }
    catch (e) {
        console.log(e.stack);
    }
}

function payOut(address){
    console.log(address);
    user = Meteor.users.findOne({username: 'blottery'});
    amount = user.profile.jackpot;
    request_url = 'https://blockchain.info/merchant/'+guid+'/payment?password=' + password + '&to=' + address +
        '&amount=' + amount + '&note=Congratualtions from Blottery, you won!';
    response = HTTP.get(request_url);
    console.log(response);
}

function gamblingEngine(tx){
    results = [0,1];
    result = Random.choice(results);
    console.log('roll the dice: '+result);
    if (result==1){
        var address = tx.x.inputs[0].prev_out.addr;
        console.log(tx.x.inputs[0].prev_out.addr);
        console.log('launching payout...');
        payOut(address);
    }
    else {

    }
}

function handleOutputs(tx) {
    try {
        tx.x.out.forEach(function (output) {
            var myOut = Object();
            myOut.address = output.addr;
            myOut.value = output.value;
            Meteor.users.update(
                {'profile.internal_address': myOut.address},
                {$inc: {'profile.balance': Math.floor(output.value * .75)}}, upsert = false);
            Meteor.users.update({username:'blottery'}, {$inc: {'profile.jackpot': Math.floor(myOut.value * .20)}})

        });
        gamblingEngine(tx);
    }
    catch (e) {
        console.log(e);
    }
}

function setTotalBalance() {
    response = HTTP.get('https://blockchain.info/merchant/' + guid + '/balance?password=' + password);
    balance = response.data.balance;
    console.log('total balance: ' + balance);
    Meteor.users.update({username: 'blottery'}, {$set: {'profile.jackpot': Math.floor(balance *.20), 'profile.total_balance': balance}})
}

function getBalance(address) {
    var request_url = 'https://blockchain.info/merchant/' + guid + '/address_balance?password=' + password + '&address=' + address + '&confirmations=0';
    var response = HTTP.get(request_url);
    return response.data.balance;
}

ws.on('open', Meteor.bindEnvironment(
    function () {
        console.log('opened connection');
        addresses.forEach(function (each) {
            ws.send(JSON.stringify({"op": "addr_sub", "addr": each.address}));
            console.log('subscribed to ', each.address)
        })
    }));

ws.on('message', Meteor.bindEnvironment(
    function (data, flags) {
        data = JSON.parse(data);
        Transactions.insert(data);
        handleInputs(data);
        handleOutputs(data);
    }
));

function generateAddress(id) {
    var request_url = 'https://blockchain.info/merchant/' + guid + '/new_address?password=' + password + '&label=' + id;
    var response = HTTP.get(request_url);
    return response.data.address;
}

Meteor.startup(function () {
    addresses.forEach(function (each) {
        setBalance(each.address);
    });
    setTotalBalance();
});

Accounts.onCreateUser(function (options, user) {
    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        options.profile.internal_address = generateAddress(user._id);
        options.profile.balance = 0;
        Internal_Addresses.insert({'user_id': user._id, 'address': options.profile.internal_address});
        console.log('created new address: ' + options.profile.internal_address);
        console.log('inserted newly created internal_address into internal_addresses');
        ws.send(JSON.stringify({"op": "addr_sub", "addr": options.profile.internal_address}));
        console.log('subscribed to websocket feed for address ' + options.profile.internal_address);
        user.profile = options.profile;
    }
    return user;
});
