const functions = require('@google-cloud/functions-framework');
require("dotenv").config();

functions.http('run', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.send({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId,
  });
});
