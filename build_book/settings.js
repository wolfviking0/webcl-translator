//
//  settings.js
//  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
//
//  Created by Anthony Liot.
//  Copyright (c) 2013 Anthony Liot. All rights reserved.
//

var SAMPLE = 0;
var MEMORY = 0;
var USE_GL = 0;
var USE_VAL = "";
var TITLE = "";
var PARAM = [];

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
  if (eltParts[0].toLowerCase() == "sample") {
    SAMPLE = eltParts[1];
  } else if (eltParts[0].toLowerCase() == "gl") {
    USE_GL = eltParts[1] == "off" ? 0 : 1;
  } else if (eltParts[0].toLowerCase() == "memory") {
    MEMORY = eltParts[1] == "off" ? 0 : 1; 
  } else if (eltParts[0].toLowerCase() == "validator") {
    USE_VAL = eltParts[1] == "off" ? "" : "val_";     
  } else if (eltParts[0].toLowerCase() == "title") {
    TITLE = eltParts[1];
    TITLE = TITLE.replace(/%20/gi, " ");
  } else {
    PARAM.push(eltParts);
  } 
}

function includeJS(jsFile) {
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", USE_VAL+jsFile);
  if (typeof fileref!="undefined") {
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }
}

function loadModule(argv) {
  // connect to canvas
  var preRunFunc = [];
  if (MEMORY == 1)
    preRunFunc.push(memoryprofiler_add_hooks);

  Module = {
    preRun: preRunFunc,
	  postRun: [],
    print: (function() {
      var element = document.getElementById('output');
      element.value = '';
      return function(text) {
      	text = Array.prototype.slice.call(arguments).join(' ');
      	element.value += text + '\n';
      	element.scrollTop = 1000000;
      	//console.log(text);
      };
    })(),
    printErr: function(text) {
      text = Array.prototype.slice.call(arguments).join(' ');
      console.error(text);
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


