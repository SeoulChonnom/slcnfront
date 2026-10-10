import { z } from 'zod';
import { parseOrThrow } from '@/lib/api/errors';

const nullableString = z
  .string()
  .nullish()
  .transform((v) => v ?? null);

/** 행안부 좌표 조회에 필요한 식별값 — 후보를 고르면 그대로 location에 실어 보낸다. */
const coordKeySchema = z.object({
  admCd: z.string(),
  rnMgtSn: z.string(),
  udrtYn: z.string(),
  buldMnnm: z.string(),
  buldSlno: z.string(),
});

const addressCandidateSchema = z.object({
  roadAddress: nullableString,
  jibunAddress: nullableString,
  buildingName: nullableString,
  bdMgtSn: z.string(),
  zipNo: nullableString,
  coordKey: coordKeySchema,
});

const addressSearchSchema = z.object({
  totalCount: z.number().int(),
  items: z.array(addressCandidateSchema).default([]),
});

export type CoordKey = z.infer<typeof coordKeySchema>;
export type AddressCandidate = z.infer<typeof addressCandidateSchema>;
export type AddressSearchResult = z.infer<typeof addressSearchSchema>;

export function parseAddressSearchResponse(
  payload: unknown
): AddressSearchResult {
  return parseOrThrow(addressSearchSchema, payload, 'Address search');
}
