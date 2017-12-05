const express = require('express');
const braintree = require('braintree');
const bodyParser=require('body-parser');
const app = express();
var path = require('path');
var gateway = braintree.connect({
  accessToken: 'access_token$sandbox$tqxx8y4ynscm495q$d9a76c2cabd186dc34ec5e37549a252e'
});
var mockedTransaction = {amount:0.01, currency:'USD'};
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use( express.static( __dirname + '/public' ));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/',function(req,res)
{
	res.sendFile(path.join(__dirname + '/public/checkout.html'));
	//res.sendFile('checkout.html');
});
app.get("/client_token", function (req, res) {
	console.log('generating client token');
  gateway.clientToken.generate({}, function (err, response) {
  	  	console.log('getting ready to send response');
    res.send(response.clientToken);
  });
});
app.post("/client_token", function (req, res) {
	console.log('generating client token via post, and req object is ' + req);
  gateway.clientToken.generate({}, function (err, response) {
  	console.log('getting ready to send response');
    res.send(response.clientToken);
  });
});
var createSaleRequest = function(nonce)
{
var saleRequest = {
  amount: mockedTransaction.amount,
  merchantAccountId: mockedTransaction.currency,
  paymentMethodNonce: nonce,
  orderId: "Mapped to PayPal Invoice Number",
  descriptor: {
    name: "DBA*somedemouser"
  },
  shipping: {
    firstName: "Jen",
    lastName: "Smith",
    company: "BTR",
    streetAddress: "1 E 1st St",
    extendedAddress: "5th Floor",
    locality: "Bartlett",
    region: "IL",
    postalCode: "60103",
    countryCodeAlpha2: "US"
  },
  options: {
    paypal: {
      customField: "PayPal custom field",
      description: "Description for PayPal email receipt"
    },
    submitForSettlement: true
  }
};
return saleRequest;
}


app.post("/checkout", function (req, res) {
	console.log('checkout called');
	console.log(req.body);
  var nonce = req.body.nonce;
  var saleRequest = createSaleRequest(nonce);
  console.log('sale request created' + JSON.stringify(saleRequest));
  gateway.transaction.sale(saleRequest, function (err, result) {
  if (err) {
  	console.log('error! ${err}')
    res.send("<h1>Error:  " + err + "</h1>");
  } else if (result.success) {
  	console.log('success!')
    res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
  } else {
  	console.log('error! ${result.message}' + result.message);
    res.send("<h1>Error:  " + result.message + "</h1>");
  }
});
});
console.log('listening at port 3000')
var server=app.listen(3000);
// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function() {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(function() {
    console.log("Closed out remaining connections.");
    process.exit()
  });
  
   // if after 
   setTimeout(function() {
       console.error("Could not close connections in time, forcefully shutting down");
       process.exit()
  }, 10*1000);
}

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);  