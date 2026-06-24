import type { FileRef } from '../types';
import { useTripAssetObjectUrls } from './internal/useTripAssetObjectUrls';

export function useTripAssetUrls(refs: Array<FileRef | null | undefined>) {
  return useTripAssetObjectUrls(refs).objectUrls;
}
