// MODE
var MODE = "gpu";
var PARAM = "";

// Global Module
var Module = {};

// parse parameter of html page
if (typeof pageParams === 'undefined') {
  var pageParams = window.location.search || '';
}

if (pageParams[0] == '?') pageParams = pageParams.substr(1);
var urlParts = pageParams.split('&');

// set new value with the parameter of url
for (var i = 0; i < urlParts.length; i++) {
  var eltParts = urlParts[i].split('=');
  if (eltParts[0].toLowerCase() == "mode") {
	  MODE = eltParts[1];
  } else if (eltParts[0].toLowerCase() == "param") {
	  PARAM = eltParts[1];
  } 

}

function includeJS(jsFile) {
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", jsFile);
  if (typeof fileref!="undefined") {
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }
}

function initArguments() {
  var argv = [];
  argv[0] = MODE;
          
  var paramParts = PARAM.split(' ');
  for (var i = 0; i < paramParts.length; i++) {
	  argv[i+1] = paramParts[i];
  }

  return argv;
}

function loadModule(argv) {
  // connect to canvas
  Module = {
    preRun: [],
	  postRun: [],
  	print: (
      function() {
        var element = document.getElementById('output');
        element.value = ''; // clear browser cache
        return function(text) {
          element.value += text + "\n";
          element.scrollTop = 99999; // focus on bottom
        };
      })(),
    printErr:
      function(text) {
        if (0) { // XXX disabled for safety typeof dump == 'function') {
          dump(text + '\n'); // fast, straight to the real console
        } else {
          console.log(text);
        }
      },
    canvas:
      document.getElementById('glCanvas'),
    setStatus:
      function(text) {
        if (Module['setStatus'].interval)
          clearInterval(Module['setStatus'].interval);
          var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
          var statusElement = document.getElementById('status');
          var progressElement = document.getElementById('progress');
          if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2])*100;
            progressElement.max = parseInt(m[4])*100;
            progressElement.hidden = false;
          } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;
          }
          statusElement.innerHTML = text;
        },
      onFullScreen:
        function(isFullScreen) {
          if (isFullScreen) {
            Module['ccall']('emscripten_set_canvas_size', null, ['number', 'number'], [window.innerWidth, window.innerHeight]);
          } else {
            Module['ccall']('emscripten_set_canvas_size', null, ['number', 'number'], [WIDTH, HEIGHT]);
          }
        },
      totalDependencies: 0,
      monitorRunDependencies:
        function(left) {
          this.totalDependencies = Math.max(this.totalDependencies, left);
          Module['setStatus'](left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
        }
  };
  
  Module['setStatus']('Downloading...');
  Module['noImageDecoding'] = true;
  Module['noAudioDecoding'] = true;
  Module['arguments'] = argv;
     
}


