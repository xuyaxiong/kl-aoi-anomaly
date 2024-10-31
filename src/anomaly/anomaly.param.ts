import { ImageSize } from './anomaly.bo';

export interface AnomalyParam {
  imageName: string;
  dbPath: string;
  imageBuf: Buffer;
  imageSize: ImageSize;
  flawCount: number;
  anomalyThreshold: number;
  ignores: number[];
  isFirst: boolean;
  dieNum: number;
  dieBuffer: Buffer;
  pos: Pos;
  lensParams: LensParams;
  mappingParams: MappingParams;
  rectifyParams: RectifyParams;
  roiCornerPoint: any;
  chipNum: number;
  chipSize: number[];
  imageSavePath: string;
  maskSavePath: string;
}

export interface LoadShildParam {
  path: string;
  maxRow: number;
  maxCol: number;
}
