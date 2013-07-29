
(function() {

  if (typeof Module == 'undefined') Module = {};
  if (!Module['preRun']) Module['preRun'] = [];
  Module["preRun"].push(function() {

function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}

    function DataRequest() {}
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.requests[name] = this;
      },
      send: function() {}
    };
  
    var filePreload0 = new DataRequest();
    filePreload0.open('GET', 'reduce_float_kernel.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file reduce_float_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_float_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_float_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_float_kernel.cl');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'reduce_float2_kernel.cl', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file reduce_float2_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_float2_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_float2_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_float2_kernel.cl');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'reduce_float4_kernel.cl', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file reduce_float4_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_float4_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_float4_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_float4_kernel.cl');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'reduce_int_kernel.cl', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file reduce_int_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_int_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_int_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_int_kernel.cl');
    filePreload3.send(null);

    var filePreload4 = new DataRequest();
    filePreload4.open('GET', 'reduce_int2_kernel.cl', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file reduce_int2_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_int2_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_int2_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_int2_kernel.cl');
    filePreload4.send(null);

    var filePreload5 = new DataRequest();
    filePreload5.open('GET', 'reduce_int4_kernel.cl', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file reduce_int4_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'reduce_int4_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp reduce_int4_kernel.cl');

      });
    };
    Module['addRunDependency']('fp reduce_int4_kernel.cl');
    filePreload5.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = 'reduce_kernel.data';
    var REMOTE_PACKAGE_NAME = 'reduce_kernel.data';
    var PACKAGE_UUID = '2bf1b4dd-1b0c-4f72-825c-2f313e6b61cd';
  
    function fetchRemotePackage(packageName, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        if (event.loaded && event.total) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: event.total
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        curr = DataRequest.prototype.requests['reduce_float_kernel.cl'];
        var data = byteArray.subarray(0, 6961);
        var ptr = Module['_malloc'](6961);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 6961);
        curr.onload();
      
        curr = DataRequest.prototype.requests['reduce_float2_kernel.cl'];
        var data = byteArray.subarray(6961, 14189);
        var ptr = Module['_malloc'](7228);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 7228);
        curr.onload();
      
        curr = DataRequest.prototype.requests['reduce_float4_kernel.cl'];
        var data = byteArray.subarray(14189, 21875);
        var ptr = Module['_malloc'](7686);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 7686);
        curr.onload();
      
        curr = DataRequest.prototype.requests['reduce_int_kernel.cl'];
        var data = byteArray.subarray(21875, 28803);
        var ptr = Module['_malloc'](6928);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 6928);
        curr.onload();
      
        curr = DataRequest.prototype.requests['reduce_int2_kernel.cl'];
        var data = byteArray.subarray(28803, 35995);
        var ptr = Module['_malloc'](7192);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 7192);
        curr.onload();
      
        curr = DataRequest.prototype.requests['reduce_int4_kernel.cl'];
        var data = byteArray.subarray(35995, 43642);
        var ptr = Module['_malloc'](7647);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 7647);
        curr.onload();
                Module['removeRunDependency']('datafile_reduce_kernel.data');

    };
    Module['addRunDependency']('datafile_reduce_kernel.data');

    function handleError(error) {
      console.error('package error:', error);
    };
  
    if (!Module.preloadResults)
      Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
      });

})();

