import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RegisterStepBasicInfo } from '@/domains/inspection/components/register/RegisterStepBasicInfo';
import type { VisitBasicFormValues } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import { renderWithProviders } from '@/test/helpers/render';

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionTags: () => ({ data: [] }),
}));

function BasicInfo() {
  const [values, setValues] = useState<VisitBasicFormValues>({
    visitedAtDate: '2026-11-15',
    visitedAtTime: '14:00',
    revisitIntent: null,
    oneLineReview: '',
    memo: '',
    pros: '',
    cons: '',
    tags: [],
  });

  return (
    <RegisterStepBasicInfo
      mode='plan'
      values={values}
      onFieldChange={(key, value) =>
        setValues((current) => ({ ...current, [key]: value }))
      }
      savedAtLabel=''
      errors={{}}
    />
  );
}

describe('RegisterStepBasicInfo Korean tags', () => {
  it.each([
    { isComposing: true, keyCode: 13 },
    { isComposing: false, keyCode: 229 },
  ])(
    'keeps the composing text until Enter is pressed after composition (%o)',
    (ime) => {
      renderWithProviders(<BasicInfo />);
      const input = screen.getByPlaceholderText('태그를 입력하고 Enter');

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: '소음' } });
      fireEvent.keyDown(input, { key: 'Enter', ...ime });
      expect(
        screen.queryByRole('button', { name: '태그 소음 지우기' })
      ).toBeNull();
      expect((input as HTMLInputElement).value).toBe('소음');

      fireEvent.compositionEnd(input, { data: '음' });
      fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
      fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

      expect(
        screen.getAllByRole('button', { name: '태그 소음 지우기' })
      ).toHaveLength(1);
      expect(
        screen.queryByRole('button', { name: '태그 음 지우기' })
      ).toBeNull();
      expect((input as HTMLInputElement).value).toBe('');
    }
  );
});
