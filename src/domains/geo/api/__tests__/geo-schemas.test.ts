import { describe, expect, it } from 'vitest';
import { parseAddressSearchResponse } from '@/domains/geo/api/geo-schemas';

const coordKey = {
  admCd: '1120011500',
  rnMgtSn: '112003115001',
  udrtYn: '0',
  buldMnnm: '135',
  buldSlno: '0',
};

describe('parseAddressSearchResponse', () => {
  it('parses a full candidate', () => {
    const result = parseAddressSearchResponse({
      totalCount: 12,
      items: [
        {
          roadAddress: '서울특별시 성동구 용답토방길 135',
          jibunAddress: '서울특별시 성동구 성수동1가 685-1',
          buildingName: '트리마제',
          bdMgtSn: '1120011500106850001000001',
          zipNo: '04773',
          coordKey,
        },
      ],
    });

    expect(result.totalCount).toBe(12);
    expect(result.items[0].coordKey).toEqual(coordKey);
    expect(result.items[0].buildingName).toBe('트리마제');
  });

  it('accepts null or missing roadAddress / jibunAddress / buildingName / zipNo', () => {
    const result = parseAddressSearchResponse({
      totalCount: 1,
      items: [
        {
          roadAddress: null,
          jibunAddress: null,
          buildingName: null,
          bdMgtSn: 'B1',
          coordKey,
        },
      ],
    });

    expect(result.items[0]).toMatchObject({
      roadAddress: null,
      jibunAddress: null,
      buildingName: null,
      zipNo: null,
    });
  });

  it('rejects a candidate without a coordKey', () => {
    expect(() =>
      parseAddressSearchResponse({
        totalCount: 1,
        items: [{ bdMgtSn: 'B1', roadAddress: 'x' }],
      })
    ).toThrow();
  });
});
