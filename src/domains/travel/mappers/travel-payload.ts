import type { FileBoxItem, TravelFileBoxItemCdo } from '@/domains/travel/types';

type TravelTargetType = TravelFileBoxItemCdo['targetType'];
type TravelRole = TravelFileBoxItemCdo['role'];

function isTravelTargetType(
  targetType: FileBoxItem['targetType']
): targetType is TravelTargetType {
  return targetType !== 'TRIP';
}

function isTravelRole(role: FileBoxItem['role']): role is TravelRole {
  return role === 'COVER' || role === 'GALLERY';
}

function isRootCover(item: Pick<FileBoxItem, 'targetType' | 'role'>) {
  return item.targetType === 'TRAVEL' && item.role === 'COVER';
}

function isRootGallery(item: Pick<FileBoxItem, 'targetType' | 'role'>) {
  return item.targetType === 'TRAVEL' && item.role === 'GALLERY';
}

/**
 * Re-sends an item the travel already has. The `id` tells the server to keep
 * it (with its sort order) rather than treat it as new, and every field goes
 * back as-is — the server replaces the whole list, so anything dropped here,
 * `rawFileAssetId` included, is lost.
 */
function toKeptItem(
  item: FileBoxItem & { targetType: TravelTargetType; role: TravelRole }
): TravelFileBoxItemCdo {
  return {
    id: item.id,
    fileAssetId: item.fileAssetId,
    ...(item.rawFileAssetId ? { rawFileAssetId: item.rawFileAssetId } : {}),
    targetType: item.targetType,
    ...(item.targetId ? { targetId: item.targetId } : {}),
    role: item.role,
    ...(item.caption ? { caption: item.caption } : {}),
    sortOrder: item.sortOrder,
  };
}

/**
 * Builds the `files` array for a `TravelCdo`/`TravelUdo` create/update
 * payload from already-uploaded file asset ids. Pure — it takes ids, not
 * `File`s, so upload orchestration (calling `travelFilesApi`) stays in the
 * component layer.
 *
 * On update the server replaces the travel's whole file list with this array,
 * so `existingItems` (the travel's current files) are always carried over.
 * A new cover replaces only the travel's own cover; day- and place-level
 * photos stay. New album photos go after the existing ones.
 *
 * New items never set `targetId`: they all attach to the travel itself.
 */
export function buildTravelFileBoxItems(input: {
  coverFileId: string | null;
  albumFileIds: string[];
  existingItems?: readonly FileBoxItem[];
}): TravelFileBoxItemCdo[] {
  const keptItems = (input.existingItems ?? [])
    .filter(
      (
        item
      ): item is FileBoxItem & {
        targetType: TravelTargetType;
        role: TravelRole;
      } => isTravelTargetType(item.targetType) && isTravelRole(item.role)
    )
    .filter((item) => input.coverFileId === null || !isRootCover(item))
    .map(toKeptItem);

  // The server treats sortOrder <= 0 as "unset" and renumbers it to the next
  // slot, which can collide with an explicit 1 — so numbering starts at 1.
  const nextGallerySortOrder =
    Math.max(
      0,
      ...keptItems.filter(isRootGallery).map((item) => item.sortOrder ?? 0)
    ) + 1;

  const items: TravelFileBoxItemCdo[] = [];

  if (input.coverFileId !== null) {
    items.push({
      fileAssetId: input.coverFileId,
      targetType: 'TRAVEL',
      role: 'COVER',
      sortOrder: 1,
    });
  }

  items.push(...keptItems);

  input.albumFileIds.forEach((fileAssetId, index) => {
    items.push({
      fileAssetId,
      targetType: 'TRAVEL',
      role: 'GALLERY',
      sortOrder: nextGallerySortOrder + index,
    });
  });

  return items;
}
