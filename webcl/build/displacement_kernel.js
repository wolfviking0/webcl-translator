
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
    filePreload0.open('GET', '/displacement_kernel.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file /displacement_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'displacement_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /displacement_kernel.cl');

      });
    };
    Module['addRunDependency']('fp /displacement_kernel.cl');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', '/stpeters_probe.pfm', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file /stpeters_probe.pfm failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'stpeters_probe.pfm', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /stpeters_probe.pfm');

      });
    };
    Module['addRunDependency']('fp /stpeters_probe.pfm');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', '/phong.frag', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file /phong.frag failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'phong.frag', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /phong.frag');

      });
    };
    Module['addRunDependency']('fp /phong.frag');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', '/phong.vert', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file /phong.vert failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'phong.vert', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /phong.vert');

      });
    };
    Module['addRunDependency']('fp /phong.vert');
    filePreload3.send(null);

    var filePreload4 = new DataRequest();
    filePreload4.open('GET', '/skybox.frag', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file /skybox.frag failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'skybox.frag', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /skybox.frag');

      });
    };
    Module['addRunDependency']('fp /skybox.frag');
    filePreload4.send(null);

    var filePreload5 = new DataRequest();
    filePreload5.open('GET', '/skybox.vert', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file /skybox.vert failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'skybox.vert', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /skybox.vert');

      });
    };
    Module['addRunDependency']('fp /skybox.vert');
    filePreload5.send(null);

    var filePreload6 = new DataRequest();
    filePreload6.open('GET', '/fresnel.frag', true);
    filePreload6.responseType = 'arraybuffer';
    filePreload6.onload = function() {
      var arrayBuffer = filePreload6.response;
      assert(arrayBuffer, 'Loading file /fresnel.frag failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'fresnel.frag', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /fresnel.frag');

      });
    };
    Module['addRunDependency']('fp /fresnel.frag');
    filePreload6.send(null);

    var filePreload7 = new DataRequest();
    filePreload7.open('GET', '/fresnel.vert', true);
    filePreload7.responseType = 'arraybuffer';
    filePreload7.onload = function() {
      var arrayBuffer = filePreload7.response;
      assert(arrayBuffer, 'Loading file /fresnel.vert failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'fresnel.vert', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /fresnel.vert');

      });
    };
    Module['addRunDependency']('fp /fresnel.vert');
    filePreload7.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/displacement_kernel.data';
    var REMOTE_PACKAGE_NAME = 'displacement_kernel.data';
    var PACKAGE_UUID = 'db9f1f09-c45e-4ee3-84f0-b227bea46409';
  
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
      
        curr = DataRequest.prototype.requests['/displacement_kernel.cl'];
        var data = byteArray.subarray(0, 11348);
        var ptr = Module['_malloc'](11348);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 11348);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/stpeters_probe.pfm'];
        var data = byteArray.subarray(11348, 27011371);
        var ptr = Module['_malloc'](27000023);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 27000023);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/phong.frag'];
        var data = byteArray.subarray(27011371, 27016745);
        var ptr = Module['_malloc'](5374);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 5374);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/phong.vert'];
        var data = byteArray.subarray(27016745, 27020187);
        var ptr = Module['_malloc'](3442);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3442);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/skybox.frag'];
        var data = byteArray.subarray(27020187, 27023672);
        var ptr = Module['_malloc'](3485);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3485);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/skybox.vert'];
        var data = byteArray.subarray(27023672, 27027041);
        var ptr = Module['_malloc'](3369);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 3369);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/fresnel.frag'];
        var data = byteArray.subarray(27027041, 27033983);
        var ptr = Module['_malloc'](6942);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 6942);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/fresnel.vert'];
        var data = byteArray.subarray(27033983, 27038267);
        var ptr = Module['_malloc'](4284);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 4284);
        curr.onload();
                Module['removeRunDependency']('datafile_../build/displacement_kernel.data');

    };
    Module['addRunDependency']('datafile_../build/displacement_kernel.data');

    function handleError(error) {
      console.error('package error:', error);
    };
  
    if (!Module.preloadResults)
      Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
      });

})();

