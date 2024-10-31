const FFI = require('ffi-napi');
const DLL_PATH = 'D:\\kl-storage\\dll\\';
const ffiCb = new Map();

export const rectify = () => {
  const pathArray = process.env.PATH.split(';');
  pathArray.unshift(DLL_PATH);
  process.env.PATH = pathArray.join(';');

  const Library = new FFI.Library(DLL_PATH + 'rectify', {
    calculateChipsCoorV2: [
      'int',
      [
        'int',
        'string',
        'int',
        'int',
        'int',
        'string',
        'double*',
        'double*',
        'double*',
        'double*',
        'double*',
        'int',
        'double*',
        'int',
        'string',
        'double',
        'double**',
      ],
    ],

    releaseArray: ['void', ['double **']],

    readDetectRegionInfo: [
      'int',
      ['uchar*', 'int', 'int', 'int', 'int*', 'double**'],
    ],

    setMeasureCallback: ['bool', ['pointer']],

    get_dll_version: ['string', []],
  });

  Library.addMeasureListener = (cb) => {
    const callback = FFI.Callback(
      'void',
      ['int', 'uchar*', 'int', 'int', 'int', 'double*', 'double*', 'int'],
      (...args) => {
        cb(args);
      },
    );
    ffiCb.set(Math.random(), callback);
    Library.setMeasureCallback(callback);
    return cb;
  };

  return Library;
};

const rectifyDll = rectify();
export default rectifyDll;
