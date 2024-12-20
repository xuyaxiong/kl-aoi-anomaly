import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const ref = require('ref-napi') as typeof import('ref-napi');
const _ = require('lodash');
import '../extension';
import { loadImage } from 'src/utils/image_utils';
import { ImageSize } from './anomaly.bo';
import { AnomalyParam } from './anomaly.param';
import { anomaly1Dll } from '../wrapper/anomaly';
import rectifyDll from '../wrapper/rectify';

const resolveMap = new Map();

@Injectable()
export class AnomalyService {
  private enginePath: string;
  private flawCount: number;
  private flawDIM: number;
  private offset: number;
  private channel: number;
  private width: number;
  private height: number;

  constructor(private readonly configService: ConfigService) {
    this.enginePath = this.configService.get<string>('enginePath');
    this.flawCount = this.configService.get<number>('flawCount');
    this.flawDIM = this.configService.get<number>('flawDIM');
    this.offset = this.configService.get<number>('offset');
    this.channel = this.configService.get<number>('channel');
    this.width = this.configService.get<number>('width');
    this.height = this.configService.get<number>('height');

    this.initEngine();
  }

  private listener(args) {
    const imgName = args[0];
    const { flawList, anomalyList } = parseAnomalyBuf(args[3], 20, 384, 395);
    resolveMap.get(imgName)({ flawList, anomalyList });
  }

  private initEngine() {
    anomaly1Dll.initEngine(
      this.enginePath,
      1,
      this.channel,
      this.height,
      this.width,
      this.flawDIM,
    );
    anomaly1Dll.addDetectListener(this.listener);
  }

  async anomaly(anomalyParam: AnomalyParam) {
    const res = await this._anomaly(
      anomalyParam.imageName,
      anomalyParam.dbPath,
      anomalyParam.imageBuf,
      anomalyParam.imageSize,
      this.flawCount,
      this.offset,
      anomalyParam.anomalyThreshold,
      anomalyParam.ignores,
      anomalyParam.isFirst,
      anomalyParam.dieNum,
      anomalyParam.dieBuffer,
      anomalyParam.pos,
      anomalyParam.lensParams,
      anomalyParam.mappingParams,
      anomalyParam.rectifyParams,
      anomalyParam.roiCornerPoint,
      anomalyParam.chipNum,
      anomalyParam.chipSize,
      anomalyParam.imageSavePath,
      anomalyParam.maskSavePath,
    );
    return res;
  }

  private _loadShild(mapImgPath: string, maxRow: number, maxCol: number) {
    const image = loadImage(mapImgPath, maxCol, maxRow, 1);
    const dieNumBuf = Buffer.alloc(4);
    const diePointer = ref.alloc('pointer');
    const retVal = rectifyDll.readDetectRegionInfo(
      image.buffer,
      maxRow,
      maxCol,
      1,
      dieNumBuf,
      diePointer,
    );
    const dieNum = dieNumBuf.readUint32LE();
    const dieBuf = diePointer.readPointer(0, dieNum * 8);
    return { dieBuf, dieNum };
  }

  private _anomaly(
    imageName: string,
    dbPath: string,
    imageBuf: Buffer,
    imageSize: ImageSize,
    flawCount: number,
    offset: number,
    anomalyThreshold: number,
    ignores: number[],
    isFirst: boolean,
    dieNum: number,
    dieBuffer: Buffer,
    pos: Pos,
    lensParams: LensParams,
    mappingParams: MappingParams,
    rectifyParams: RectifyParams,
    roiCornerPoint: any,
    chipNum: number,
    chipSize: number[],
    imageSavePath: string,
    maskSavePath: string,
  ) {
    let detectBuffer = Buffer.alloc(flawCount * offset * 4);
    let { dieNum: dieNum1, dieBuf } = this._loadShild(
      'C:\\Users\\xuyax\\Desktop\\test_measure_data\\37.20241016_test1\\37.20241016_test1\\map.png',
      715,
      715,
    );
    let image = loadImage(
      'C:\\Users\\xuyax\\Desktop\\2_96.40910339355469_40.311100006103516_0.jpg',
      5120,
      5120,
      3,
    );
    const retVal = anomaly1Dll.anomalyDetect_FULL2(
      imageName,
      dbPath,
      image.buffer,
      imageSize.height,
      imageSize.width,
      imageSize.channel,
      flawCount,
      anomalyThreshold,
      ignores.intToBuffer(),
      ignores.length,
      isFirst,
      1,
      dieNum1,
      dieBuf,
      detectBuffer,
      (pos as Array<number>).doubleToBuffer(),
      (lensParams as Array<number>).doubleToBuffer(),
      (rectifyParams as Array<number>).doubleToBuffer(),
      (mappingParams as Array<number>).doubleToBuffer(),
      roiCornerPoint.doubleToBuffer(),
      chipNum,
      chipSize.doubleToBuffer(),
      imageSavePath,
      maskSavePath,
    );
    console.log('retVal =', retVal);
    return new Promise((resolve, reject) => {
      if (retVal !== 1) reject(retVal);
      resolveMap.set(imageName, resolve);
    });
  }
}

function parseAnomalyBuf(
  anomalyBuf: Buffer,
  flawCount: number,
  flawDIM: number,
  offset: number,
) {
  const arr = anomalyBuf.toFloatArr();
  const flawList = [];
  const anomalyMap = new Map();
  const anomalyList = [];
  for (let i = 0; i < flawCount; i++) {
    let idx = i * offset;
    const position = arr.slice(idx, idx + 4);
    idx += 4;
    const feature = arr
      .slice(idx, idx + flawDIM)
      .floatToBuffer()
      .toString('base64');
    idx += flawDIM;
    position.push(arr[idx], arr[idx + 1]);
    idx += 2;
    const rowColId = arr.slice(idx, idx + 3);
    const C = rowColId[0];
    const R = rowColId[1];
    const chipId = rowColId[2];
    idx += 3;
    const type = arr[idx];
    flawList.push({
      type,
      feature,
      position,
      coor: { R, C, chipId },
    });
    const key = `${R}-${C}-${chipId}`;
    if (!anomalyMap.has(key)) {
      anomalyMap.set(key, { R, C, chipId, types: [] });
    }
    anomalyMap.get(key)['types'].push(type);
  }
  for (const [key, value] of anomalyMap.entries()) {
    anomalyList.push({
      ...value,
    });
  }
  return {
    flawList,
    anomalyList,
  };
}
