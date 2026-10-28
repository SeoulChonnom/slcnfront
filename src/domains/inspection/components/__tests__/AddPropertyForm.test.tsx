import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AddPropertyForm } from '@/domains/inspection/components/AddPropertyForm';
import { renderWithProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

const candidate = {
  roadAddress: '서울특별시 성동구 용답토방길 135',
  jibunAddress: null,
  buildingName: '트리마제',
  bdMgtSn: 'B-1',
  zipNo: null,
  coordKey: {
    admCd: '1',
    rnMgtSn: '2',
    udrtYn: '0',
    buldMnnm: '135',
    buldSlno: '0',
  },
};

function createdProperty() {
  return {
    propertyId: 'prop-9',
    inspectionVisitId: 'visit-1',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '트리마제',
    name: null,
    interestLevel: null,
    status: 'DRAFT',
    sortOrder: 1,
    incompleteSummary: {
      unansweredRequiredCount: 0,
      draftPropertyCount: 0,
      draftVisitCount: 0,
    },
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid='location'>{location.pathname}</output>;
}

function setup() {
  const posts: Record<string, unknown>[] = [];
  server.use(
    http.get('*/inspection-visits/visit-1/complex-names', () =>
      HttpResponse.json([])
    ),
    http.get('*/geo/addresses', () =>
      HttpResponse.json({ totalCount: 1, items: [candidate] })
    )
  );
  const utils = renderWithProviders(
    <>
      <AddPropertyForm device='main' areaId='area-1' visitId='visit-1' />
      <LocationProbe />
    </>
  );

  return { posts, ...utils };
}

async function openAndPick(user: ReturnType<typeof setup>['user']) {
  await user.click(screen.getByRole('button', { name: '+ 매물 추가' }));
  await user.type(screen.getByLabelText('주소 (선택)'), '트리마제');
  await user.click(await screen.findByRole('option'));
}

const locationFailure = () =>
  HttpResponse.json(
    {
      title: '좌표 정보가 없는 주소',
      status: 400,
      code: 'ADDRESS_COORDINATE_NOT_FOUND',
    },
    { status: 400 }
  );

describe('AddPropertyForm location', () => {
  it('fills an empty complex name with the building name and POSTs the location with coordKey', async () => {
    const { user, posts } = setup();
    server.use(
      http.post(
        '*/inspection-visits/visit-1/properties',
        async ({ request }) => {
          posts.push((await request.json()) as Record<string, unknown>);
          return HttpResponse.json(createdProperty());
        }
      )
    );

    await openAndPick(user);
    expect(
      (screen.getByLabelText(/단지\/건물명/) as HTMLInputElement).value
    ).toBe('트리마제');

    await user.click(
      screen.getByRole('button', { name: '추가하고 계속 쓰기' })
    );

    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].location).toEqual({
      bdMgtSn: 'B-1',
      roadAddress: '서울특별시 성동구 용답토방길 135',
      coordKey: candidate.coordKey,
    });
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toContain('prop-9')
    );
  });

  it('keeps the inputs and asks before registering without a location; never retries by itself', async () => {
    const { user, posts } = setup();
    server.use(
      http.post(
        '*/inspection-visits/visit-1/properties',
        async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          posts.push(body);
          return body.location
            ? locationFailure()
            : HttpResponse.json(createdProperty());
        }
      )
    );

    await openAndPick(user);
    await user.click(
      screen.getByRole('button', { name: '추가하고 계속 쓰기' })
    );

    expect(
      await screen.findByText(
        '주소를 저장하지 못했습니다. 위치 없이 등록할까요?'
      )
    ).toBeTruthy();
    expect(screen.getByText(/좌표 정보가 없는 주소/)).toBeTruthy();
    expect(
      (screen.getByLabelText(/단지\/건물명/) as HTMLInputElement).value
    ).toBe('트리마제');
    expect(posts).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: '위치 없이 등록' }));

    await waitFor(() => expect(posts).toHaveLength(2));
    expect('location' in posts[1]).toBe(false);
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toContain('prop-9')
    );
  });

  it('"다른 주소 고르기" clears the selection and focuses the address field', async () => {
    const { user, posts } = setup();
    server.use(
      http.post(
        '*/inspection-visits/visit-1/properties',
        async ({ request }) => {
          posts.push((await request.json()) as Record<string, unknown>);
          return locationFailure();
        }
      )
    );

    await openAndPick(user);
    await user.click(
      screen.getByRole('button', { name: '추가하고 계속 쓰기' })
    );
    await user.click(
      await screen.findByRole('button', { name: '다른 주소 고르기' })
    );

    const field = screen.getByLabelText('주소 (선택)');
    await waitFor(() => expect(document.activeElement).toBe(field));
    expect(
      screen.queryByText('주소를 저장하지 못했습니다. 위치 없이 등록할까요?')
    ).toBeNull();
    expect(posts).toHaveLength(1);
  });
});
