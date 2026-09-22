import { Skeleton } from '@/components/ui/Skeleton';
import { useInspectionQuestionVersions } from '@/domains/inspection/hooks/inspection-queries';

type QuestionVersionHistoryProps = {
  questionId: string;
};

/**
 * screen_design.md §5.5 "버전 기록" accordion body. Fetched lazily — only
 * mounted once a row is expanded — since it is a second round trip per
 * question.
 *
 * api.md §9: versions carry no creation timestamp at all yet
 * (fe_implementation_decisions.md §6 lists it as a pending BE follow-up), so
 * every row shows "날짜 미상" rather than guessing a date.
 */
export function QuestionVersionHistory({
  questionId,
}: QuestionVersionHistoryProps) {
  const { data, isPending, isError } =
    useInspectionQuestionVersions(questionId);

  if (isPending) {
    return (
      <div className='slcn-inspection-qversions' aria-hidden='true'>
        <Skeleton className='slcn-inspection-qversions__skel' />
        <Skeleton className='slcn-inspection-qversions__skel' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className='slcn-inspection-qversions__error'>
        버전 기록을 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <ul className='slcn-inspection-qversions'>
      {data.map((version) => (
        <li key={version.versionNo} className='slcn-inspection-qversions__row'>
          <span className='slcn-inspection-qversions__no'>
            v{version.versionNo}
          </span>
          <span className='slcn-inspection-qversions__content'>
            {version.content}
          </span>
          <span className='slcn-inspection-qversions__meta'>
            날짜 미상 · 답변 {version.answerCount ?? 0}건
          </span>
        </li>
      ))}
    </ul>
  );
}
