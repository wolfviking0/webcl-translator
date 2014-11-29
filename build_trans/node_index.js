
location = {pathname:process.argv[1]};

var arguments = process.argv.slice(2);
for (var i = 0; i < arguments.length; i++) {
  console.log(i + ': ' + arguments[i]);
}

var samples = [
  "node_imagecopy.js",
  "node_eventprofiling.js",
  "node_attractor.js",
  "node_dxtcompressor.js",
  "node_particles.js",
  "node_fluids.js",
  "node_sakura.js",
];

if (arguments.length == 0) {
  sample = 0;
} else {
  sample = arguments[0];
}

console.info("Launch WebCL-Translator sample ("+sample+") : "+samples[sample]);

webcl=require('../../../webcl-node/webcl');

require('./'+samples[sample]);
