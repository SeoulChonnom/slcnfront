import type { TravelFileBoxItemCdo } from '@/domains/travel/types';

/**
 * Builds the `files` array for a `TravelCdo`/`TravelUdo` create/update
 * payload from already-uploaded file asset ids. Pure — it takes ids, not
 * `File`s, so upload orchestration (calling `travelFilesApi`) stays in the
 * component layer.
 *
 * `targetId` is never set: at create time no `TRAVEL` row exists yet for the
 * server to attach the file to, and on update the server resolves the
 * travel's own files by the travel id in the URL, not by a per-item target.
 */
export function buildTravelFileBoxItems(input: {
  coverFileId: string | null;
  albumFileIds: string[];
}): TravelFileBoxItemCdo[] {
  const items: TravelFileBoxItemCdo[] = [];

  if (input.coverFileId !== null) {
    items.push({
      fileAssetId: input.coverFileId,
      targetType: 'TRAVEL',
      role: 'COVER',
      sortOrder: 0,
    });
  }

  input.albumFileIds.forEach((fileAssetId, index) => {
    items.push({
      fileAssetId,
      targetType: 'TRAVEL',
      role: 'GALLERY',
      sortOrder: index,
    });
  });

  return items;
}
