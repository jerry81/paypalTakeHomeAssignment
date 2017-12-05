var progress=document.getElementById('progress');
var progress2=document.getElementById('progress2');
        function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}


        var handleLogin = function()
        {

            //var formData=new FormData(document.getElementById('fakeLoginForm'));
            var formElement = document.querySelector("form");
            var formData=new FormData(formElement);
           // var xhr = new XMLHttpRequest();
            var xhr= createCORSRequest('get','http://localhost:3000/client_token');
            //xhr.open('post','http://localhost:3000/client_token');
            xhr.onload=function(event)
            {
                //progress.classList.add('hidden');
                progress.innerHTML='The client token is '+xhr.response;
                renderPayButton(xhr.response);
            }
            xhr.onError=function(event)
            {
                progress.classList.add('hidden');
            }
            progress.classList.remove('hidden');
            xhr.send(formData);

        }
        var handleNonce=function(nonce)
        {
           // var xhr = new XMLHttpRequest();
            var xhr= createCORSRequest('post','http://localhost:3000/checkout');
            //xhr.open('post','http://localhost:3000/client_token');
            xhr.onload=function(event)
            {
                           progress2.innerHTML='The transaction result is '+xhr.response;
            }
            xhr.onError=function(event)
            {
                 progress2.classList.add('hidden');
            }
            console.log('sending ' + JSON.stringify(nonce));
            xhr.setRequestHeader('Content-Type', 'application/json');
             progress2.classList.remove('hidden');
            xhr.send(JSON.stringify(nonce));
        }
        var renderPayButton=function(token)
        {
paypal.Button.render({
  braintree: braintree,
  client: {
    production: token,
    sandbox: token
  },
  env: 'sandbox', // Or 'sandbox'
  commit: true, // This will add the transaction amount to the PayPal button

            payment: function(data, actions) {

                // Make a call to create the payment

                return actions.payment.create({
                    payment: {
                        transactions: [
                            {
                                amount: { total: '0.01', currency: 'USD' }
                            }
                        ]
                    }
                });
            },




  onAuthorize: function (payload) {
    // Submit `payload.nonce
    console.log(JSON.stringify(payload));
    handleNonce({nonce:payload.nonce}); 
  }
}, '#paypal-button');
}