
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
    filePreload0.open('GET', 'preprocessed_rendering_kernel_dl.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file preprocessed_rendering_kernel_dl.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'preprocessed_rendering_kernel_dl.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp preprocessed_rendering_kernel_dl.cl');

      });
    };
    Module['addRunDependency']('fp preprocessed_rendering_kernel_dl.cl');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'preprocessed_rendering_kernel.cl', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file preprocessed_rendering_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'preprocessed_rendering_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp preprocessed_rendering_kernel.cl');

      });
    };
    Module['addRunDependency']('fp preprocessed_rendering_kernel.cl');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'rendering_kernel_dl.cl', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file rendering_kernel_dl.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel_dl.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp rendering_kernel_dl.cl');

      });
    };
    Module['addRunDependency']('fp rendering_kernel_dl.cl');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'rendering_kernel.cl', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file rendering_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp rendering_kernel.cl');

      });
    };
    Module['addRunDependency']('fp rendering_kernel.cl');
    filePreload3.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = 'smallpt_kernel.data';
    var REMOTE_PACKAGE_NAME = 'smallpt_kernel.data';
    var PACKAGE_UUID = 'e318d931-0dc3-40a8-8307-599d656d0ba5';
  
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
      
        curr = DataRequest.prototype.requests['preprocessed_rendering_kernel_dl.cl'];
        var data = byteArray.subarray(0, 24641);
        var ptr = Module['_malloc'](24641);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 24641);
        curr.onload();
      
        curr = DataRequest.prototype.requests['preprocessed_rendering_kernel.cl'];
        var data = byteArray.subarray(24641, 49279);
        var ptr = Module['_malloc'](24638);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 24638);
        curr.onload();
      
        curr = DataRequest.prototype.requests['rendering_kernel_dl.cl'];
        var data = byteArray.subarray(49279, 52498);
        var ptr = Module['_malloc'](3219);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3219);
        curr.onload();
      
        curr = DataRequest.prototype.requests['rendering_kernel.cl'];
        var data = byteArray.subarray(52498, 55714);
        var ptr = Module['_malloc'](3216);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3216);
        curr.onload();
                Module['removeRunDependency']('datafile_smallpt_kernel.data');

    };
    Module['addRunDependency']('datafile_smallpt_kernel.data');

    function handleError(error) {
      console.error('package error:', error);
    };
  
    if (!Module.preloadResults)
      Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
      });

})();

