import type {
  ComplexNameScope,
  InspectionAreaListParams,
  InspectionVisitListParams,
  TagScope,
} from '@/domains/inspection/types';

export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
};

export const profileQueryKeys = {
  all: ['profile'] as const,
  detail: (username: string | null) =>
    [...profileQueryKeys.all, 'detail', username] as const,
  passwordVerification: () =>
    [...profileQueryKeys.all, 'password-verification'] as const,
  update: (username: string | null) =>
    [...profileQueryKeys.all, 'update', username] as const,
};

export const tripQueryKeys = {
  all: ['trip'] as const,
  list: () => [...tripQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...tripQueryKeys.all, 'detail', id] as const,
  quiz: (tripId: string) => [...tripQueryKeys.all, 'quiz', tripId] as const,
  file: (path: string) => [...tripQueryKeys.all, 'file', path] as const,
};

export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  calendars: () => [...scheduleQueryKeys.all, 'calendars'] as const,
  range: (start: string, end: string) =>
    [...scheduleQueryKeys.all, 'range', start, end] as const,
  month: (year: number, month: number) =>
    [...scheduleQueryKeys.all, 'month', year, month] as const,
  week: (startDate: string) =>
    [...scheduleQueryKeys.all, 'week', startDate] as const,
};

export const travelQueryKeys = {
  all: ['travel'] as const,
  list: () => [...travelQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...travelQueryKeys.all, 'detail', id] as const,
};

export const inspectionQueryKeys = {
  all: ['inspection'] as const,
  areaList: (params: InspectionAreaListParams) =>
    [...inspectionQueryKeys.all, 'area-list', params] as const,
  areaDetail: (areaId: string, visitId: string | null) =>
    [...inspectionQueryKeys.all, 'area-detail', areaId, visitId] as const,
  areaProperties: (areaId: string, complexName: string, name: string) =>
    [
      ...inspectionQueryKeys.all,
      'area-properties',
      areaId,
      complexName,
      name,
    ] as const,
  property: (propertyId: string) =>
    [...inspectionQueryKeys.all, 'property', propertyId] as const,
  visitList: (params: InspectionVisitListParams) =>
    [...inspectionQueryKeys.all, 'visit-list', params] as const,
  visit: (visitId: string) =>
    [...inspectionQueryKeys.all, 'visit', visitId] as const,
  tags: (keyword: string, scope: TagScope | null) =>
    [...inspectionQueryKeys.all, 'tags', keyword, scope] as const,
  complexNames: (visitId: string, scope: ComplexNameScope) =>
    [...inspectionQueryKeys.all, 'complex-names', visitId, scope] as const,
  questions: (includeDisabled: boolean, withAnswerCount: boolean) =>
    [
      ...inspectionQueryKeys.all,
      'questions',
      includeDisabled,
      withAnswerCount,
    ] as const,
  questionVersions: (questionId: string) =>
    [...inspectionQueryKeys.all, 'question-versions', questionId] as const,
};

export const shoesQueryKeys = {
  all: ['shoes'] as const,
  catalog: () => [...shoesQueryKeys.all, 'catalog'] as const,
  detail: (brand: string, shoesName: string) =>
    [...shoesQueryKeys.all, 'detail', brand, shoesName] as const,
};
