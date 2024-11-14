import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const ref = require('ref-napi') as typeof import('ref-napi');
const _ = require('lodash');
import '../extension';
import { loadImage } from 'src/utils/image_utils';
import { ShieldInfo } from './anomaly.bo';
import { AnomalyParam } from './anomaly.param';
import { anomaly1Dll } from '../wrapper/anomaly';
import rectifyDll from '../wrapper/rectify';

const resolveMap = new Map();
const cache = new Map();

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
    const fnoStr = args[0];
    const detectBuffer = cache.get(fnoStr);
    const { flawList, anomalyList } = parseAnomalyBuf(
      parseInt(fnoStr),
      detectBuffer,
      20,
      384,
      395,
    );
    resolveMap.get(fnoStr)({ flawList, anomalyList });
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
      anomalyParam.fno,
      anomalyParam.imageName,
      anomalyParam.imagePath,
      anomalyParam.dbName,
      anomalyParam.imageBuf,
      this.flawCount,
      this.offset,
      anomalyParam.anomalyThreshold,
      anomalyParam.ignores,
      anomalyParam.isFirst,
      anomalyParam.pos,
      anomalyParam.lensParams,
      anomalyParam.mappingParams,
      anomalyParam.rectifyParams,
      anomalyParam.roiCornerPoint,
      anomalyParam.chipNum,
      anomalyParam.chipSize,
      anomalyParam.shildInfo,
      anomalyParam.imageSavePath,
      anomalyParam.maskSavePath,
    );
    return res;
  }

  private _loadShild(mapImgPath: string, maxRow: number, maxCol: number) {
    const image = loadImage(mapImgPath, maxCol, maxRow, 1);
    const shildNumBuf = Buffer.alloc(4);
    const diePointer = ref.alloc('pointer');
    const retVal = rectifyDll.readDetectRegionInfo(
      image.buffer,
      maxRow,
      maxCol,
      1,
      shildNumBuf,
      diePointer,
    );
    const shildNum = shildNumBuf.readUint32LE();
    const shildBuf = diePointer.readPointer(0, shildNum * 8);
    return { shildBuf, shildNum };
  }

  private _anomaly(
    fno: number,
    imageName: string,
    imagePath: string,
    dbPath: string,
    imageBuf: Buffer,
    flawCount: number,
    offset: number,
    anomalyThreshold: number,
    ignores: number[],
    isFirst: boolean,
    pos: Pos,
    lensParams: LensParams,
    mappingParams: MappingParams,
    rectifyParams: RectifyParams,
    roiCornerPoint: any,
    chipNum: number,
    chipSize: number[],
    shildInfo: ShieldInfo,
    imageSavePath: string,
    maskSavePath: string,
  ) {
    const fnoStr = fno.toString();
    let detectBuffer = Buffer.alloc(flawCount * offset * 4);
    cache.set(fnoStr, detectBuffer);
    let { shildNum, shildBuf } = this._loadShild(
      shildInfo.path,
      shildInfo.row,
      shildInfo.col,
    );
    let image = loadImage(imagePath, this.width, this.height, this.channel);
    const retVal = anomaly1Dll.anomalyDetect_FULL2(
      fnoStr,
      dbPath,
      image.buffer,
      this.height,
      this.width,
      this.channel,
      flawCount,
      anomalyThreshold,
      ignores.intToBuffer(),
      ignores.length,
      isFirst,
      1,
      shildNum,
      shildBuf,
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
      resolveMap.set(fnoStr, resolve);
    });
  }
}

function parseAnomalyBuf(
  fno: number,
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
      anomalyMap.set(key, { fno, R, C, chipId, types: [] });
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
