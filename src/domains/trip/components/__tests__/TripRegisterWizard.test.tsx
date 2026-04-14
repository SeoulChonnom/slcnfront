import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/helpers/render';
import { TripRegisterWizard } from '../TripRegisterWizard';

describe('TripRegisterWizard', () => {
  it('blocks step navigation until required fields are filled and submits on the last step', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device="main" onSubmit={onSubmit} />,
      {
        route: '/main/map/register',
      },
    );

    await user.click(screen.getByRole('button', { name: '다음 단계' }));
    expect(screen.getByText('유형을 선택해주세요.')).toBeTruthy();

    await user.click(screen.getByRole('radio', { name: '아영' }));
    await user.type(screen.getByLabelText('날짜'), '2099-12-31');
    await user.type(screen.getByLabelText('나들이 이름'), '연말 나들이');
    const step1Inputs = container.querySelectorAll<HTMLInputElement>(
      '.slcn-file-dropzone__input',
    );
    const logoInput = step1Inputs[0];

    if (!logoInput) {
      throw new Error('logo input not found');
    }

    await user.upload(
      logoInput,
      new File(['logo'], 'logo.png', { type: 'image/png' }),
    );
    await user.click(screen.getByRole('button', { name: '다음 단계' }));

    expect(screen.getByText('STEP 2').getAttribute('data-active')).toBe('true');

    const step2Inputs = container.querySelectorAll<HTMLInputElement>(
      '.slcn-file-dropzone__input',
    );
    const map1Input = step2Inputs[0];

    if (!map1Input) {
      throw new Error('map1 input not found');
    }

    await user.upload(
      map1Input,
      new File(['map1'], 'map1.png', { type: 'image/png' }),
    );
    await user.type(screen.getByLabelText('드라이브 링크'), 'https://drive.google.com/x');
    await user.click(screen.getByRole('button', { name: '다음 단계' }));

    expect(screen.getByText('STEP 3').getAttribute('data-active')).toBe('true');

    await user.type(screen.getByLabelText('퀴즈 제목'), '정답은?');
    await user.type(screen.getByLabelText('보기 1'), '보기1');
    await user.type(screen.getByLabelText('보기 2'), '보기2');
    await user.click(screen.getByRole('radio', { name: '2번' }));
    await user.type(screen.getByLabelText('정답 제목'), '정답');
    await user.type(screen.getByLabelText('정답 설명'), '맞았습니다.');
    await user.type(screen.getByLabelText('오답 제목'), '오답');
    await user.type(screen.getByLabelText('오답 설명'), '다시 시도하세요.');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      info2: '연말 나들이',
      quizTitle: '정답은?',
      quizAnswer: '2',
    });
  });
});
