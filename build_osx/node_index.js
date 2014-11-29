
location = {pathname:process.argv[1]};

global.urlParts = process.argv.slice(2);
global.sample = 0;

// Global Module
Module = {};

for (var i = 0; i < global.urlParts.length; i++) {
  console.log(i + ': ' + global.urlParts[i]);
}

var samples = [
  "node_hello.js",
  "node_transpose.js",
  "node_trajectories.js",
  "node_scan.js",
  "node_reduce.js",
  "node_noise.js",
  "node_qjulia.js",
];

WebGL = require('node-webgl');
document = WebGL.document();
window = document;
Image = WebGL.Image;

console.info("Launch WebCL-OSX sample ("+global.sample+") : "+samples[global.sample]);

webcl=require('../../webcl-node/webcl');

settings=require('./settings.js');

console.info("");
console.info("****************************************");
console.info(Module);
console.info("****************************************");
console.info("");

require('./'+samples[global.sample]);
