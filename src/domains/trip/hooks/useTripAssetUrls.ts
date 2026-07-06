import type { FileAsset } from '../types';
import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrls(refs: Array<FileAsset | null | undefined>) {
  return useTripAssetObjectUrls(refs).objectUrls;
}
