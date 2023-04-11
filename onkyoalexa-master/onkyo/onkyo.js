// My First Onkyo Amp for Alexa
// Trying to play with Node.Js and Express to see how to build this.

// Variable Section
var express = require('express');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

// Load configs
var config = JSON.parse(fs.readFileSync('./onkyo.local.json', function (err) {
  if (err) { // load default if local fails
    config = JSON.parse(fs.readFileSync('./onkyo.json', function (err) {
      console.log(" Failed to load config: onkyo.json");
      throw err;
    }));
    console.log(" Failed to load config: onkyo.local.json");
    throw err;
  }
}));

exports.config = config;

// Initialize SSL keys
var credentials = {
  key: fs.readFileSync(config.ssl.sslPath + config.ssl.credentials.key),
  cert: fs.readFileSync(config.ssl.sslPath + config.ssl.credentials.cert)
};

// Initialize OnkyoConroller; make sure to this after config variable is initialized
// as config is in the global scope and used by onkyo-controller
const myOnkyo = require('./onkyo-controller');

// Create the HTTPS server instance 
var server = https.createServer(credentials, app);

var alexaVerifier = require('alexa-verifier');

// Verify requestor
function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({ message: 'Verification Failure', error: err });
      } else {
        next();
      }
    }
  );
}

// set up bodyParser for use with my app
app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

// Look at the request header and do something
app.get('/', function (req, res) {
  // dump the contents of req on to console
  var beautify = require("json-beautify");
  var obj = req.headers;
  var helloworld = { "hello": "world" };

  console.log(beautify(obj, null, 2, 100));
  res.send(helloworld)
});


// Look at the request header and do something
app.post('/', requestVerifier, function (req, res) {

  var beautify = require("json-beautify");
  var resStr = {
    "version": "1.0",
    "response": {
      "shouldEndSession": true,
      "outputSpeech": {
        "type": "SSML",
        "ssml": null
      }
    }
  };
  // Display Body contents for debugging purpose
  console.log(beautify(req.body, null, 2, 100));

  if (req.body.request.type === 'LaunchRequest') {
    /* Tell Alexa what this app can do */
    resStr.response.outputSpeech.ssml =
      "<speak> Hi! I am the Genie! I can control your onkyo receiver using voice commands \
		from Alexa. You can power on, power off, change listening modes, increase or decrease volume, \
		and switch inputs!</speak>";
    resStr.response.shouldEndSession = false;
  }
  else if (req.body.request.type === 'SessionEndedRequest') {
    // Close the session
    resStr.response.shouldEndSession = true;

  }
  else if (req.body.request.type === 'IntentRequest') {
    var intent = req.body.request.intent;
    // Call the controller
    resStr.response.outputSpeech.ssml = myOnkyo.controller(intent);
    resStr.response.shouldEndSession = false;
  }
  console.log(beautify(resStr, null, 2, 100)); // debug
  res.json(resStr);
});

// Now start listening for requests on port specified in the config file
server.listen(config.ssl.port, function () {
  console.log("server running on " + config.ssl.hostname + " port: " + config.ssl.port)
});
