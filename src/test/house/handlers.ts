import { HttpResponse, http } from 'msw';
import { server } from '@/test/helpers/server';
import { houseFixtures } from '@/test/house/fixtures';

export function installHouseHandlers() {
  const requests: Request[] = [];
  const base = 'http://localhost:8080/api';
  server.use(
    http.get(`${base}/users/me`, () =>
      HttpResponse.json({
        username: 'string',
        name: '테스트',
        profileImage: null,
      })
    ),
    http.post(`${base}/users/login`, () =>
      HttpResponse.json({
        accessToken: 'house-test-token',
        username: 'string',
        name: '테스트',
        roleList: ['USER'],
      })
    ),
    http.get(`${base}/house/*`, ({ request }) => {
      requests.push(request);
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/house/', '');
      switch (path) {
        case 'budget-policy':
          return HttpResponse.json(houseFixtures.policy);
        case 'meta':
          return HttpResponse.json(houseFixtures.meta);
        case 'complexes/summary':
          return HttpResponse.json(houseFixtures.summary);
        case 'complexes':
          return HttpResponse.json(houseFixtures.complexes);
        case 'complexes/search':
          return HttpResponse.json(houseFixtures.search);
        case 'compare': {
          const columns = (url.searchParams.get('items') ?? '')
            .split(',')
            .filter(Boolean)
            .map((item) => {
              const [complexId, area] = item.split(':');
              return {
                ...houseFixtures.column,
                complexId,
                area,
                areaInfo: { avgExclusiveArea: null, bucket: area },
              };
            });
          return HttpResponse.json({ columns, missingIds: [] });
        }
        case 'rankings':
          return HttpResponse.json({
            ...houseFixtures.rankings,
            type: url.searchParams.get('type'),
            area: url.searchParams.get('area'),
          });
        default:
          if (path === `complexes/${houseFixtures.detail.complexId}`) {
            return HttpResponse.json(houseFixtures.detail);
          }
          return HttpResponse.json(
            { code: 'HOUSE_COMPLEX_NOT_FOUND', title: '없는 단지입니다.' },
            { status: 404 }
          );
      }
    })
  );
  return requests;
}
