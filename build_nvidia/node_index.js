
location = {pathname:process.argv[1]};

var arguments = process.argv.slice(2);
for (var i = 0; i < arguments.length; i++) {
  console.log(i + ': ' + arguments[i]);
}

var samples = [
  "node_bandwidthtest.js",           // 0
  "node_blackscholes.js",            // 1
  "node_boxfilter.js",               // 2
  "node_convolutionseparable.js",    // 3
  "node_copycomputeoverlap.js",      // 4
  "node_dct8x8.js",                  // 5
  "node_devicequery.js",             // 6
  "node_dotproduct.js",              // 7
  "node_dxtcompression.js",          // 8
  "node_fdtd3d.js",                  // 9
  //
  "node_hiddenmarkovmodel.js",       // 10
  "node_histogram.js",               // 11
  "node_matrixmul.js",               // 12  
  "node_matvecmul.js",               // 13  
  "node_mersennetwister.js",         // 14  
  "node_nbody.js",                   // 15  
  "node_particles.js",               // 16
  "node_quasirandomgenerator.js",    // 17
  "node_radixsort.js",               // 18
  "node_recursivegaussian.js",       // 19
  //
  "node_reduction.js",               // 20    
  "node_scan.js",                    // 21
  "node_simplegl.js",                // 22    
  "node_simplemultigpu.js",          // 23          
  "node_sobelfilter.js",             // 24      
  "node_sortingnetworks.js",         // 25          
  "node_transpose.js",               // 26    
  "node_tridiagonal.js",             // 27      
  "node_vectoradd.js",               // 28  
];

if (arguments.length == 0) {
  sample = 0;
} else {
  sample = arguments[0];
}

console.info("Launch WebCL-OCL-NVidia sample ("+sample+") : "+samples[sample]);

webcl=require('../../webcl-node/webcl');

require('./'+samples[sample]);
