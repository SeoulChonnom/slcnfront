import { getButtonClassName } from '@/components/ui/button-class-name';
import { Card } from '@/components/ui/Card';
import type { ShoeItem } from '@/domains/shoes/types';
import { cn } from '@/lib/utils/cn';

type ShoeVideoPanelProps = {
  shoe: ShoeItem;
};

export function ShoeVideoPanel({ shoe }: ShoeVideoPanelProps) {
  if (!shoe.videoLink && !shoe.videoUrl) {
    return null;
  }

  return (
    <Card className='slcn-shoe-video-panel' tone='default'>
      <div className='slcn-shoe-video-panel__header'>
        <h2 className='slcn-shoe-video-panel__title'>참고 영상</h2>
        {shoe.videoDesc ? (
          <p className='slcn-shoe-video-panel__description'>{shoe.videoDesc}</p>
        ) : null}
      </div>
      {shoe.videoUrl ? (
        <video
          className='slcn-shoe-video-panel__video'
          src={shoe.videoUrl}
          poster={shoe.videoPosterUrl ?? undefined}
          controls
          preload='metadata'
          muted
          loop
          playsInline
        />
      ) : null}
      {shoe.videoLink ? (
        <a
          href={shoe.videoLink}
          target='_blank'
          rel='noreferrer'
          className={cn(
            getButtonClassName({ variant: 'secondary', size: 'md' })
          )}
        >
          영상 보러가기
        </a>
      ) : null}
    </Card>
  );
}
