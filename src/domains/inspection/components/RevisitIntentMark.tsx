import type { RevisitIntent } from '@/domains/inspection/types';
import {
  REVISIT_INTENT_META,
  REVISIT_INTENT_UNDECIDED_LABEL,
} from '@/domains/inspection/utils/inspection-format';
import { cn } from '@/lib/utils/cn';

type RevisitIntentMarkProps = {
  intent: RevisitIntent | null;
  /** 지역 리스트 = 글자형(`text`), 회차 패널 머리 = 테두리 pill형(`pill`) — screen_design.md §4.1 */
  variant?: 'text' | 'pill';
  className?: string;
};

/**
 * Icon + label pair for a revisit intent. Never renders color alone — `NO`
 * intentionally reuses `--color-body-muted` rather than error red
 * (screen_design.md §4.1: "안 갈 예정"은 오류가 아니다).
 */
export function RevisitIntentMark({
  intent,
  variant = 'text',
  className,
}: RevisitIntentMarkProps) {
  if (!intent) {
    return (
      <span
        className={cn(
          'slcn-inspection-revisit-mark',
          'slcn-inspection-revisit-mark--undecided',
          variant === 'pill' && 'slcn-inspection-revisit-mark--pill',
          className
        )}
      >
        {REVISIT_INTENT_UNDECIDED_LABEL}
      </span>
    );
  }

  const meta = REVISIT_INTENT_META[intent];

  return (
    <span
      className={cn(
        'slcn-inspection-revisit-mark',
        `slcn-inspection-revisit-mark--${intent.toLowerCase()}`,
        variant === 'pill' && 'slcn-inspection-revisit-mark--pill',
        className
      )}
      style={{ color: meta.colorVar }}
    >
      <span aria-hidden='true'>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
