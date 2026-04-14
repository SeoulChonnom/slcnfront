import { Card } from '../../../components/ui/Card';
import { getButtonClassName } from '../../../components/ui/button-class-name';
import { cn } from '../../../lib/utils/cn';
import type { ShoeItem } from '../types';

type ShoeVideoPanelProps = {
  shoe: ShoeItem;
};

export function ShoeVideoPanel({ shoe }: ShoeVideoPanelProps) {
  if (!shoe.videoLink && !shoe.videoUrl) {
    return null;
  }

  return (
    <Card className="slcn-shoe-video-panel" tone="default">
      <div className="slcn-shoe-video-panel__header">
        <p className="slcn-shoe-video-panel__eyebrow">Reference Clip</p>
        <h2 className="slcn-shoe-video-panel__title display-hand">영상으로 보는 무드</h2>
      </div>
      {shoe.videoDesc ? (
        <p className="slcn-shoe-video-panel__description">{shoe.videoDesc}</p>
      ) : null}
      {shoe.videoUrl ? (
        <video
          className="slcn-shoe-video-panel__video"
          src={shoe.videoUrl}
          controls
          preload="metadata"
          muted
          loop
          playsInline
        />
      ) : null}
      {shoe.videoLink ? (
        <a
          href={shoe.videoLink}
          target="_blank"
          rel="noreferrer"
          className={cn(getButtonClassName({ variant: 'secondary', size: 'md' }))}
        >
          영상 링크 열기
        </a>
      ) : null}
    </Card>
  );
}
