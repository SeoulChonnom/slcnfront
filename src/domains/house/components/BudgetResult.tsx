import type { BudgetPolicy } from '@/domains/house/types';
import type {
  BudgetInput,
  BudgetSuccess,
} from '@/domains/house/utils/calculate-budget';
import { formatEok } from '@/domains/house/utils/format-eok';

type BudgetResultProps = {
  result: BudgetSuccess;
  policy: BudgetPolicy;
  input: BudgetInput;
};

function FundsRow({
  operator,
  name,
  value,
  total = false,
}: {
  operator: string;
  name: string;
  value: number;
  total?: boolean;
}) {
  return (
    <div className={`funds__row${total ? ' funds__row--total' : ''}`}>
      <span className='funds__op'>{operator}</span>
      <span className='funds__name'>{name}</span>
      <span className='funds__val num'>{formatEok(value)}</span>
    </div>
  );
}

export function BudgetResult({ result, policy, input }: BudgetResultProps) {
  const formattedBudget = formatEok(result.budget);
  const constraint =
    result.bindingConstraint === 'CAP' ? '상품 상한' : result.bindingConstraint;
  const limits = [
    {
      key: 'DSR',
      title: 'DSR 한도',
      rule: `연소득 대비 상환 ${policy.dsrRatio * 100}%`,
      amount: result.dsrLimit,
    },
    {
      key: 'LTV',
      title: 'LTV 한도',
      rule: `${input.firstTimeBuyer ? '생애최초' : '생애최초 아님'} ${Math.round(result.ltv * 100)}%`,
      amount: result.ltvLimit,
    },
    {
      key: 'CAP',
      title: '주택가격별 상품 상한',
      rule:
        result.capPrice === null
          ? '최고 주택가격 구간'
          : `${formatEok(result.capPrice)} 이하`,
      amount: result.cap,
    },
  ];
  const tax = Math.round(
    result.costBreakdown.acquisition + result.costBreakdown.localEducation
  );
  const broker = Math.round(result.costBreakdown.brokerage);
  return (
    <>
      <div className='result-hero'>
        <div>
          <span className='result-hero__label'>매수 가능 예산</span>
          <div className='result-hero__value num'>
            {formattedBudget.slice(0, -1)}
            <small>{formattedBudget.slice(-1)}</small>
          </div>
        </div>
        <p className='result-hero__note'>
          대출 한도 세 가지 중 가장 낮은 값({constraint})이 적용됐어요.
        </p>
      </div>
      <div className='result-cols'>
        <div>
          <h3 className='sub-title'>
            대출 한도 판정{' '}
            <span className='house-fine'>가장 낮은 항목이 예상대출이에요</span>
          </h3>
          <table className='verdict'>
            <caption className='sr-only'>대출 한도 판정</caption>
            <thead className='sr-only'>
              <tr>
                <th scope='col'>항목과 기준</th>
                <th scope='col'>금액</th>
              </tr>
            </thead>
            <tbody>
              {limits.map((limit) => (
                <tr
                  key={limit.key}
                  className={
                    limit.key === result.bindingConstraint
                      ? 'is-min'
                      : undefined
                  }
                >
                  <th scope='row'>
                    {limit.title}
                    {limit.key === result.bindingConstraint ? (
                      <span className='house-tag'>최솟값 · 적용</span>
                    ) : null}
                    <span className='rule'>{limit.rule}</span>
                  </th>
                  <td className='num'>{formatEok(limit.amount)}</td>
                </tr>
              ))}
              <tr className='is-final'>
                <th scope='row'>
                  적용 예상대출<span className='rule'>{constraint} 기준</span>
                </th>
                <td className='num'>{formatEok(result.appliedLoan)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className='sub-title'>매수 자금 구성</h3>
          <div className='funds'>
            <FundsRow operator='' name='보유현금' value={result.cash} />
            <FundsRow operator='+' name='예상대출' value={result.appliedLoan} />
            <FundsRow
              operator='='
              name='합계'
              value={result.cash + result.appliedLoan}
            />
            <div className='funds__row'>
              <span className='funds__op'>−</span>
              <details>
                <summary>
                  <span className='funds__name'>
                    부대비용{' '}
                    <span className='num'>{formatEok(result.costs)}</span>
                  </span>
                  <span aria-hidden='true'>⌄</span>
                  <span className='house-fine'>취득세·중개·등기 펼쳐 보기</span>
                </summary>
                <dl className='funds__breakdown num'>
                  <div>
                    <dt>
                      취득세·지방교육세
                      {input.firstTimeBuyer ? ' (감면 반영)' : ''}
                    </dt>
                    <dd>{formatEok(tax)}</dd>
                  </div>
                  <div>
                    <dt>중개보수 (부가세 포함)</dt>
                    <dd>{formatEok(broker)}</dd>
                  </div>
                  <div>
                    <dt>등기비용·반올림 정산</dt>
                    <dd>{formatEok(result.costs - tax - broker)}</dd>
                  </div>
                </dl>
              </details>
            </div>
            <FundsRow
              operator='−'
              name={`안전여유금${input.reserveManwon.trim() === '' ? ' (기본값)' : ''}`}
              value={result.reserve}
            />
            {result.surplus > 0 ? (
              <FundsRow operator='−' name='남는 금액' value={result.surplus} />
            ) : null}
            <FundsRow
              operator='='
              name='매수 가능 예산'
              value={result.budget}
              total
            />
          </div>
        </div>
      </div>
      <p className='rate-note'>
        DSR 산정금리{' '}
        <strong className='num'>
          {(result.rate + policy.stressRatePp).toFixed(1)}%
        </strong>{' '}
        = 입력 {result.rate.toFixed(1)}% + 스트레스{' '}
        {policy.stressRatePp.toFixed(1)}%p · 정책 기준일{' '}
        <span className='num'>{policy.effectiveFrom}</span>
      </p>
    </>
  );
}
