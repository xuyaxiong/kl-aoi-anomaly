import { ShieldInfo } from './anomaly.bo';

export interface AnomalyParam {
  fno: number;
  imageName: string;
  imagePath: string;
  imageBuf: Buffer;
  dbName: string;
  flawCount: number;
  anomalyThreshold: number;
  ignores: number[];
  isFirst: boolean;
  pos: Pos;
  lensParams: LensParams;
  mappingParams: MappingParams;
  rectifyParams: RectifyParams;
  roiCornerPoint: any;
  chipNum: number;
  chipSize: number[];
  shildInfo: ShieldInfo;
  imageSavePath: string;
  maskSavePath: string;
}
