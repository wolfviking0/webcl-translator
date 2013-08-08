
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
    filePreload0.open('GET', 'camera.h', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file camera.h failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'camera.h', byteArray, true, true, function() {
        Module['removeRunDependency']('fp camera.h');

      });
    };
    Module['addRunDependency']('fp camera.h');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'geomfunc.h', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file geomfunc.h failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'geomfunc.h', byteArray, true, true, function() {
        Module['removeRunDependency']('fp geomfunc.h');

      });
    };
    Module['addRunDependency']('fp geomfunc.h');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'simplernd.h', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file simplernd.h failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'simplernd.h', byteArray, true, true, function() {
        Module['removeRunDependency']('fp simplernd.h');

      });
    };
    Module['addRunDependency']('fp simplernd.h');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'geom.h', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file geom.h failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'geom.h', byteArray, true, true, function() {
        Module['removeRunDependency']('fp geom.h');

      });
    };
    Module['addRunDependency']('fp geom.h');
    filePreload3.send(null);

    var filePreload4 = new DataRequest();
    filePreload4.open('GET', 'vec.h', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file vec.h failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'vec.h', byteArray, true, true, function() {
        Module['removeRunDependency']('fp vec.h');

      });
    };
    Module['addRunDependency']('fp vec.h');
    filePreload4.send(null);

    var filePreload5 = new DataRequest();
    filePreload5.open('GET', 'preprocessed_rendering_kernel_dl.cl', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file preprocessed_rendering_kernel_dl.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'preprocessed_rendering_kernel_dl.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp preprocessed_rendering_kernel_dl.cl');

      });
    };
    Module['addRunDependency']('fp preprocessed_rendering_kernel_dl.cl');
    filePreload5.send(null);

    var filePreload6 = new DataRequest();
    filePreload6.open('GET', 'preprocessed_rendering_kernel.cl', true);
    filePreload6.responseType = 'arraybuffer';
    filePreload6.onload = function() {
      var arrayBuffer = filePreload6.response;
      assert(arrayBuffer, 'Loading file preprocessed_rendering_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'preprocessed_rendering_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp preprocessed_rendering_kernel.cl');

      });
    };
    Module['addRunDependency']('fp preprocessed_rendering_kernel.cl');
    filePreload6.send(null);

    var filePreload7 = new DataRequest();
    filePreload7.open('GET', 'rendering_kernel_dl.cl', true);
    filePreload7.responseType = 'arraybuffer';
    filePreload7.onload = function() {
      var arrayBuffer = filePreload7.response;
      assert(arrayBuffer, 'Loading file rendering_kernel_dl.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel_dl.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp rendering_kernel_dl.cl');

      });
    };
    Module['addRunDependency']('fp rendering_kernel_dl.cl');
    filePreload7.send(null);

    var filePreload8 = new DataRequest();
    filePreload8.open('GET', 'rendering_kernel.cl', true);
    filePreload8.responseType = 'arraybuffer';
    filePreload8.onload = function() {
      var arrayBuffer = filePreload8.response;
      assert(arrayBuffer, 'Loading file rendering_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp rendering_kernel.cl');

      });
    };
    Module['addRunDependency']('fp rendering_kernel.cl');
    filePreload8.send(null);

    var filePreload9 = new DataRequest();
    filePreload9.open('GET', 'rendering_kernel_custom.cl', true);
    filePreload9.responseType = 'arraybuffer';
    filePreload9.onload = function() {
      var arrayBuffer = filePreload9.response;
      assert(arrayBuffer, 'Loading file rendering_kernel_custom.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel_custom.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp rendering_kernel_custom.cl');

      });
    };
    Module['addRunDependency']('fp rendering_kernel_custom.cl');
    filePreload9.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = 'smallpt_kernel.data';
    var REMOTE_PACKAGE_NAME = 'smallpt_kernel.data';
    var PACKAGE_UUID = '630bc657-49fd-4e98-ba91-73a4d40544b3';
  
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
      
        curr = DataRequest.prototype.requests['camera.h'];
        var data = byteArray.subarray(0, 1284);
        var ptr = Module['_malloc'](1284);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1284);
        curr.onload();
      
        curr = DataRequest.prototype.requests['geomfunc.h'];
        var data = byteArray.subarray(1284, 13118);
        var ptr = Module['_malloc'](11834);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 11834);
        curr.onload();
      
        curr = DataRequest.prototype.requests['simplernd.h'];
        var data = byteArray.subarray(13118, 14793);
        var ptr = Module['_malloc'](1675);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1675);
        curr.onload();
      
        curr = DataRequest.prototype.requests['geom.h'];
        var data = byteArray.subarray(14793, 16439);
        var ptr = Module['_malloc'](1646);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1646);
        curr.onload();
      
        curr = DataRequest.prototype.requests['vec.h'];
        var data = byteArray.subarray(16439, 19229);
        var ptr = Module['_malloc'](2790);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 2790);
        curr.onload();
      
        curr = DataRequest.prototype.requests['preprocessed_rendering_kernel_dl.cl'];
        var data = byteArray.subarray(19229, 43870);
        var ptr = Module['_malloc'](24641);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 24641);
        curr.onload();
      
        curr = DataRequest.prototype.requests['preprocessed_rendering_kernel.cl'];
        var data = byteArray.subarray(43870, 68508);
        var ptr = Module['_malloc'](24638);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 24638);
        curr.onload();
      
        curr = DataRequest.prototype.requests['rendering_kernel_dl.cl'];
        var data = byteArray.subarray(68508, 71727);
        var ptr = Module['_malloc'](3219);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3219);
        curr.onload();
      
        curr = DataRequest.prototype.requests['rendering_kernel.cl'];
        var data = byteArray.subarray(71727, 74943);
        var ptr = Module['_malloc'](3216);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3216);
        curr.onload();
      
        curr = DataRequest.prototype.requests['rendering_kernel_custom.cl'];
        var data = byteArray.subarray(74943, 91190);
        var ptr = Module['_malloc'](16247);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 16247);
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

