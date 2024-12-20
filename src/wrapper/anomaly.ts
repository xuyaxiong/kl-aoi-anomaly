const FFI = require('ffi-napi');
const path = require('path');
import AppConfig from '../app.config';
const DLL_PATH = AppConfig.DLL_PATH;
const ffiCb = new Map();

const anomaly = (anomalyName) => {
  const pathArray = process.env.PATH.split(';');
  pathArray.unshift(DLL_PATH);
  process.env.PATH = pathArray.join(';');
  const Library = new FFI.Library(path.join(DLL_PATH, `${anomalyName}.dll`), {
    initEngine: ['bool', ['string', 'int', 'int', 'int', 'int', 'int']],

    destroyEngine: ['bool', []],

    anomalyDetect_FULL2: [
      'int',
      [
        'string',
        'string',
        'uchar*',
        'int',
        'int',
        'int',
        'int',
        'float',
        'int *',
        'int',
        'int',
        'int',
        'string',
        'float *',
        'double *',
        'double*',
        'double*',
        'double*',
        'double*',
        'int',
        'double*',
        'string',
        'string',
      ],
    ],

    setCallback: ['bool', ['pointer']],

    get_dll_version: ['string', []],
  });

  Library.addDetectListener = (cb) => {
    const callback = FFI.Callback(
      'void',
      ['string', 'bool', 'int', 'float *', 'int *'],
      (...args) => {
        cb(args);
      },
    );
    ffiCb.set(Math.random(), callback);
    Library.setCallback(callback);
    return cb;
  };

  return Library;
};
const anomaly1Dll = anomaly('anomaly');
export { anomaly1Dll };
