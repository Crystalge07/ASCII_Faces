export type PartCategory =
  | 'head'
  | 'eyes'
  | 'nose'
  | 'mouth'
  | 'hair'
  | 'facial_hair';

export interface PartAnchor {
  x: number;
  y: number;
}

export interface RawPart {
  id: string;
  category: PartCategory;
  anchor: PartAnchor;
  rows: string[];
}

export interface NormalizedPart extends RawPart {
  width: number;
  height: number;
}

export interface PartsManifest {
  categories: PartCategory[];
  parts: RawPart[];
}
