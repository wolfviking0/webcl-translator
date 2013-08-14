
(function() {

  if (typeof Module == 'undefined') Module = {};
  if (!Module['preRun']) Module['preRun'] = [];
  Module["preRun"].push(function() {

function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
Module['FS_createPath']('/', 'scenes', true, true);

    function DataRequest() {}
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.requests[name] = this;
      },
      send: function() {}
    };
  
    var filePreload0 = new DataRequest();
    filePreload0.open('GET', '/rendering_kernel_custom.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file /rendering_kernel_custom.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'rendering_kernel_custom.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /rendering_kernel_custom.cl');

      });
    };
    Module['addRunDependency']('fp /rendering_kernel_custom.cl');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', '/scenes/caustic.scn', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file /scenes/caustic.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'caustic.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/caustic.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/caustic.scn');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', '/scenes/caustic3.scn', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file /scenes/caustic3.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'caustic3.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/caustic3.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/caustic3.scn');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', '/scenes/complex.scn', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file /scenes/complex.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'complex.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/complex.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/complex.scn');
    filePreload3.send(null);

    var filePreload4 = new DataRequest();
    filePreload4.open('GET', '/scenes/cornell_large.scn', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file /scenes/cornell_large.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'cornell_large.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/cornell_large.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/cornell_large.scn');
    filePreload4.send(null);

    var filePreload5 = new DataRequest();
    filePreload5.open('GET', '/scenes/cornell.scn', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file /scenes/cornell.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'cornell.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/cornell.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/cornell.scn');
    filePreload5.send(null);

    var filePreload6 = new DataRequest();
    filePreload6.open('GET', '/scenes/simple.scn', true);
    filePreload6.responseType = 'arraybuffer';
    filePreload6.onload = function() {
      var arrayBuffer = filePreload6.response;
      assert(arrayBuffer, 'Loading file /scenes/simple.scn failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/scenes', 'simple.scn', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /scenes/simple.scn');

      });
    };
    Module['addRunDependency']('fp /scenes/simple.scn');
    filePreload6.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/smallpt_kernel.data';
    var REMOTE_PACKAGE_NAME = 'smallpt_kernel.data';
    var PACKAGE_UUID = '09eb8518-ad31-444f-84d5-7d77109b183a';
  
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
      
        curr = DataRequest.prototype.requests['/rendering_kernel_custom.cl'];
        var data = byteArray.subarray(0, 16247);
        var ptr = Module['_malloc'](16247);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 16247);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/caustic.scn'];
        var data = byteArray.subarray(16247, 16437);
        var ptr = Module['_malloc'](190);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 190);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/caustic3.scn'];
        var data = byteArray.subarray(16437, 16730);
        var ptr = Module['_malloc'](293);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 293);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/complex.scn'];
        var data = byteArray.subarray(16730, 56250);
        var ptr = Module['_malloc'](39520);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 39520);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/cornell_large.scn'];
        var data = byteArray.subarray(56250, 56829);
        var ptr = Module['_malloc'](579);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 579);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/cornell.scn'];
        var data = byteArray.subarray(56829, 57406);
        var ptr = Module['_malloc'](577);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 577);
        curr.onload();
      
        curr = DataRequest.prototype.requests['/scenes/simple.scn'];
        var data = byteArray.subarray(57406, 57698);
        var ptr = Module['_malloc'](292);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 292);
        curr.onload();
                Module['removeRunDependency']('datafile_../build/smallpt_kernel.data');

    };
    Module['addRunDependency']('datafile_../build/smallpt_kernel.data');

    function handleError(error) {
      console.error('package error:', error);
    };
  
    if (!Module.preloadResults)
      Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
      });

})();

