import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { AddressSearchField } from '@/domains/geo/components/AddressSearchField';
import { renderWithMinimalProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

const API = '*';

const candidate = {
  roadAddress: '서울특별시 성동구 용답토방길 135',
  jibunAddress: '서울특별시 성동구 성수동1가 685-1',
  buildingName: '트리마제',
  bdMgtSn: '1120011500106850001000001',
  zipNo: '04773',
  coordKey: {
    admCd: '1120011500',
    rnMgtSn: '112003115001',
    udrtYn: '0',
    buldMnnm: '135',
    buldSlno: '0',
  },
};

function renderField(
  props: Partial<React.ComponentProps<typeof AddressSearchField>> = {}
) {
  const onSelect = vi.fn();
  const onClear = vi.fn();
  const utils = renderWithMinimalProviders(
    <AddressSearchField
      value={null}
      onSelect={onSelect}
      onClear={onClear}
      {...props}
    />
  );
  return { onSelect, onClear, ...utils };
}

describe('AddressSearchField', () => {
  it('shows the hint, lists candidates and passes the whole candidate on select', async () => {
    server.use(
      http.get(`${API}/geo/addresses`, () =>
        HttpResponse.json({ totalCount: 1, items: [candidate] })
      )
    );
    const { user, onSelect } = renderField();

    expect(screen.getByText('가까운 건물이나 주소를 입력하세요')).toBeTruthy();
    await user.type(screen.getByRole('combobox'), '트리마제');

    const option = await screen.findByRole('option');
    expect(option.textContent).toContain('서울특별시 성동구 용답토방길 135');
    expect(option.textContent).toContain('트리마제');

    await user.click(option);
    expect(onSelect).toHaveBeenCalledWith(candidate);
  });

  it('supports keyboard selection and falls back to jibunAddress', async () => {
    server.use(
      http.get(`${API}/geo/addresses`, () =>
        HttpResponse.json({
          totalCount: 1,
          items: [{ ...candidate, roadAddress: null, buildingName: null }],
        })
      )
    );
    const { user, onSelect } = renderField();

    await user.type(screen.getByRole('combobox'), '성수동');
    const option = await screen.findByRole('option');
    expect(option.textContent).toContain('성수동1가 685-1');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows the server title under the input on INVALID_ADDRESS_KEYWORD', async () => {
    server.use(
      http.get(`${API}/geo/addresses`, () =>
        HttpResponse.json(
          {
            title: '주소를 상세히 입력해 주시기 바랍니다',
            status: 400,
            code: 'INVALID_ADDRESS_KEYWORD',
          },
          { status: 400 }
        )
      )
    );
    const { user } = renderField();

    await user.type(screen.getByRole('combobox'), '성수');

    expect(
      await screen.findByText('주소를 상세히 입력해 주시기 바랍니다')
    ).toBeTruthy();
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(
      false
    );
  });

  it('disables itself with a notice on 503 ADDRESS_LOOKUP_UNAVAILABLE', async () => {
    server.use(
      http.get(`${API}/geo/addresses`, () =>
        HttpResponse.json(
          {
            title: '주소 조회 불가',
            status: 503,
            code: 'ADDRESS_LOOKUP_UNAVAILABLE',
          },
          { status: 503 }
        )
      )
    );
    const { user } = renderField();

    await user.type(screen.getByRole('combobox'), '성수동');

    expect(await screen.findByText('지금은 주소를 쓸 수 없어요')).toBeTruthy();
    await waitFor(() =>
      expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(
        true
      )
    );
  });

  it('shows the selected address with change / clear actions', async () => {
    const { user, onClear } = renderField({
      value: { bdMgtSn: 'B1', roadAddress: '서울 성동구 용답토방길 135' },
    });

    expect(screen.getByText('서울 성동구 용답토방길 135')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();

    await user.click(screen.getByRole('button', { name: '위치 지우기' }));
    expect(onClear).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '변경' }));
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('renders a parent-provided error', () => {
    renderField({ error: '주소는 저장하지 못했습니다.' });
    expect(screen.getByText('주소는 저장하지 못했습니다.')).toBeTruthy();
  });
});
