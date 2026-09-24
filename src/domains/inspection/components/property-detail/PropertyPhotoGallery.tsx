import type { FileBoxItem } from '@/domains/inspection/types';
import { buildAssetImageUrl } from '@/lib/api/asset-url';

type PropertyPhotoGalleryProps = {
  photos: FileBoxItem[];
};

/** 3-column gallery, `home-feature` variant (fe_implementation_decisions.md §3-⑧). */
export function PropertyPhotoGallery({ photos }: PropertyPhotoGalleryProps) {
  return (
    <div className='slcn-inspection-gallery'>
      {photos.map((photo) => (
        <figure key={photo.id}>
          <img
            src={buildAssetImageUrl(photo.fileAssetId, 'home-feature')}
            alt={photo.caption ?? ''}
            loading='lazy'
          />
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
