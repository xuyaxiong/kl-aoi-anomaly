export interface ImageSize {
  width: number;
  height: number;
  channel: number;
}

export interface Image extends ImageSize {
  frameId?: number;
  buffer?: Buffer;
}
