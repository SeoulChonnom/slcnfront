type KakaoLatLng = { getLat(): number; getLng(): number };
type KakaoBounds = {
  extend(position: KakaoLatLng): void;
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
};
export type KakaoMap = {
  getCenter(): KakaoLatLng;
  setCenter(position: KakaoLatLng): void;
  getLevel(): number;
  setLevel(level: number): void;
  getBounds(): KakaoBounds;
  setBounds(
    bounds: KakaoBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number
  ): void;
  relayout(): void;
};
export type KakaoOverlay = { setMap(map: KakaoMap | null): void };
export type KakaoMarker = KakaoOverlay;
export type KakaoCluster = { getSize(): number; getMarkers(): KakaoMarker[] };
type KakaoClusterer = {
  addMarkers(markers: KakaoMarker[]): void;
  clear(): void;
};
export type KakaoMaps = {
  load(callback: () => void): void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level?: number }
  ) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoBounds;
  CustomOverlay: new (options: {
    map?: KakaoMap;
    position: KakaoLatLng;
    content: HTMLElement | string;
    xAnchor?: number;
    yAnchor?: number;
    clickable?: boolean;
    zIndex?: number;
  }) => KakaoOverlay;
  Polyline: new (options: {
    path: KakaoLatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: 'solid' | 'shortdash' | 'dash' | 'longdash';
  }) => KakaoOverlay;
  Marker: new (options: {
    position: KakaoLatLng;
    opacity: number;
  }) => KakaoMarker;
  MarkerClusterer: new (options: {
    map: KakaoMap;
    averageCenter: boolean;
    minLevel: number;
    gridSize: number;
    minClusterSize: number;
  }) => KakaoClusterer;
  event: {
    addListener(target: KakaoMap, event: 'idle', callback: () => void): void;
    addListener(
      target: KakaoClusterer,
      event: 'clustered',
      callback: (clusters: KakaoCluster[]) => void
    ): void;
    removeListener(target: KakaoMap, event: 'idle', callback: () => void): void;
    removeListener(
      target: KakaoClusterer,
      event: 'clustered',
      callback: (clusters: KakaoCluster[]) => void
    ): void;
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}
