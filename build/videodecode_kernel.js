
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
    filePreload0.open('GET', 'OVDecodeRender_Kernels.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file OVDecodeRender_Kernels.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'OVDecodeRender_Kernels.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp OVDecodeRender_Kernels.cl');

      });
    };
    Module['addRunDependency']('fp OVDecodeRender_Kernels.cl');
    filePreload0.send(null);

    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'verifyH264.image', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file verifyH264.image failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'verifyH264.image', byteArray, true, true, function() {
        Module['removeRunDependency']('fp verifyH264.image');

      });
    };
    Module['addRunDependency']('fp verifyH264.image');
    filePreload1.send(null);

    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'verifyMPEG.image', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file verifyMPEG.image failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'verifyMPEG.image', byteArray, true, true, function() {
        Module['removeRunDependency']('fp verifyMPEG.image');

      });
    };
    Module['addRunDependency']('fp verifyMPEG.image');
    filePreload2.send(null);

    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'OVDecodeDataH264.zip', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file OVDecodeDataH264.zip failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'OVDecodeDataH264.zip', byteArray, true, true, function() {
        Module['removeRunDependency']('fp OVDecodeDataH264.zip');

      });
    };
    Module['addRunDependency']('fp OVDecodeDataH264.zip');
    filePreload3.send(null);

    var filePreload4 = new DataRequest();
    filePreload4.open('GET', 'OVDecodeDataMPEG.zip', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file OVDecodeDataMPEG.zip failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      
      Module['FS_createPreloadedFile']('/', 'OVDecodeDataMPEG.zip', byteArray, true, true, function() {
        Module['removeRunDependency']('fp OVDecodeDataMPEG.zip');

      });
    };
    Module['addRunDependency']('fp OVDecodeDataMPEG.zip');
    filePreload4.send(null);

    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;

    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/videodecode_kernel.data';
    var REMOTE_PACKAGE_NAME = 'videodecode_kernel.data';
    var PACKAGE_UUID = '8c80792a-94f7-4647-911a-48cd35e6e863';
  
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
      
        curr = DataRequest.prototype.requests['OVDecodeRender_Kernels.cl'];
        var data = byteArray.subarray(0, 12581);
        var ptr = Module['_malloc'](12581);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 12581);
        curr.onload();
      
        curr = DataRequest.prototype.requests['verifyH264.image'];
        var data = byteArray.subarray(12581, 1394981);
        var ptr = Module['_malloc'](1382400);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1382400);
        curr.onload();
      
        curr = DataRequest.prototype.requests['verifyMPEG.image'];
        var data = byteArray.subarray(1394981, 2777381);
        var ptr = Module['_malloc'](1382400);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1382400);
        curr.onload();
      
        curr = DataRequest.prototype.requests['OVDecodeDataH264.zip'];
        var data = byteArray.subarray(2777381, 8822381);
        var ptr = Module['_malloc'](6045000);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 6045000);
        curr.onload();
      
        curr = DataRequest.prototype.requests['OVDecodeDataMPEG.zip'];
        var data = byteArray.subarray(8822381, 23618075);
        var ptr = Module['_malloc'](14795694);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 14795694);
        curr.onload();
                Module['removeRunDependency']('datafile_../build/videodecode_kernel.data');

    };
    Module['addRunDependency']('datafile_../build/videodecode_kernel.data');

    function handleError(error) {
      console.error('package error:', error);
    };
  
    if (!Module.preloadResults)
      Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
      });

})();

