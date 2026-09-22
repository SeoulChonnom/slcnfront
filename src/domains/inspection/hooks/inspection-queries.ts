import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inspectionApi } from '@/domains/inspection/api/inspection-api';
import type {
  ComplexNameScope,
  InspectionAreaCdo,
  InspectionAreaListParams,
  InspectionAreaUdo,
  InspectionQuestionCdo,
  InspectionQuestionContentUdo,
  InspectionQuestionPolicyUdo,
  InspectionStatus,
  InspectionVisitCdo,
  InspectionVisitListParams,
  InspectionVisitUdo,
  OrderItem,
  PropertyAnswerPayload,
  TagScope,
  ViewedPropertyCdo,
  ViewedPropertyUdo,
} from '@/domains/inspection/types';
import {
  normalizePropertyLinkValue,
  type PropertyLinkKey,
} from '@/domains/inspection/utils/property-linking';
import { inspectionQueryKeys } from '@/lib/api/query-keys';

// ── Queries ───────────────────────────────────────────────────────────────────

export function useInspectionAreaList(params: InspectionAreaListParams) {
  return useQuery({
    queryKey: inspectionQueryKeys.areaList(params),
    queryFn: () => inspectionApi.getAreaList(params),
  });
}

export function useInspectionAreaDetail(
  areaId: string | undefined,
  params: { visitId?: string; includeProperties?: boolean } = {}
) {
  return useQuery({
    queryKey: inspectionQueryKeys.areaDetail(
      areaId ?? '',
      params.visitId ?? null
    ),
    queryFn: () => inspectionApi.getAreaDetail(areaId ?? '', params),
    enabled: Boolean(areaId),
  });
}

/**
 * §3-② cross-visit property linking. Normalizes `complexName`/`name` before
 * both building the query key and calling the API, so callers can pass raw
 * user-facing values without duplicating the normalization rule.
 */
export function useInspectionAreaProperties(
  areaId: string | undefined,
  link: PropertyLinkKey | undefined
) {
  const complexName = link ? normalizePropertyLinkValue(link.complexName) : '';
  const name = link ? normalizePropertyLinkValue(link.name) : '';

  return useQuery({
    queryKey: inspectionQueryKeys.areaProperties(
      areaId ?? '',
      complexName,
      name
    ),
    queryFn: () =>
      inspectionApi.getAreaProperties(areaId ?? '', complexName, name),
    enabled: Boolean(areaId && complexName && name),
  });
}

export function useInspectionProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: inspectionQueryKeys.property(propertyId ?? ''),
    queryFn: () => inspectionApi.getProperty(propertyId ?? ''),
    enabled: Boolean(propertyId),
  });
}

export function useInspectionVisitProperty(
  visitId: string | undefined,
  propertyId: string | undefined
) {
  return useQuery({
    queryKey: inspectionQueryKeys.property(propertyId ?? ''),
    queryFn: () =>
      inspectionApi.getVisitProperty(visitId ?? '', propertyId ?? ''),
    enabled: Boolean(visitId && propertyId),
  });
}

export function useInspectionVisitList(params: InspectionVisitListParams) {
  return useQuery({
    queryKey: inspectionQueryKeys.visitList(params),
    queryFn: () => inspectionApi.getVisitList(params),
  });
}

export function useInspectionVisit(visitId: string | undefined) {
  return useQuery({
    queryKey: inspectionQueryKeys.visit(visitId ?? ''),
    queryFn: () => inspectionApi.getVisit(visitId ?? ''),
    enabled: Boolean(visitId),
  });
}

/**
 * Auto-save/edit entry points must always start from the latest data — there
 * is no optimistic locking (§3-⑥), so a stale edit screen is how one save
 * silently clobbers another.
 */
export function useInspectionVisitForEdit(visitId: string | undefined) {
  return useQuery({
    queryKey: inspectionQueryKeys.visit(visitId ?? ''),
    queryFn: () => inspectionApi.getVisit(visitId ?? ''),
    enabled: Boolean(visitId),
    staleTime: 0,
  });
}

export function useInspectionComplexNames(
  visitId: string | undefined,
  scope: ComplexNameScope = 'VISIT'
) {
  return useQuery({
    queryKey: inspectionQueryKeys.complexNames(visitId ?? '', scope),
    queryFn: () => inspectionApi.getComplexNames(visitId ?? '', scope),
    enabled: Boolean(visitId),
  });
}

export function useInspectionTags(keyword: string, scope?: TagScope) {
  return useQuery({
    queryKey: inspectionQueryKeys.tags(keyword, scope ?? null),
    queryFn: () => inspectionApi.getTags({ keyword, scope }),
  });
}

export function useInspectionQuestions(
  params: { includeDisabled?: boolean; withAnswerCount?: boolean } = {}
) {
  return useQuery({
    queryKey: inspectionQueryKeys.questions(
      Boolean(params.includeDisabled),
      Boolean(params.withAnswerCount)
    ),
    queryFn: () => inspectionApi.getQuestions(params),
  });
}

export function useInspectionQuestionVersions(questionId: string | undefined) {
  return useQuery({
    queryKey: inspectionQueryKeys.questionVersions(questionId ?? ''),
    queryFn: () => inspectionApi.getQuestionVersions(questionId ?? ''),
    enabled: Boolean(questionId),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
//
// Invalidation is broad (`inspectionQueryKeys.all`) rather than per-key.
// Unlike travel, most writes here ripple across multiple independently
// fetched views at once (area list counts, area detail's visit rail, the
// flat visit list, a property's own detail) — see fe_implementation_decisions.md
// §3-⑦ (status can cascade DRAFT down from property → visit). Narrow
// invalidation would need to enumerate every affected key at every call site
// and would drift the moment a new cross-reference is added.

function useInvalidateInspection() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.all });
}

export function useCreateInspectionArea() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionAreaCdo) =>
      inspectionApi.createArea(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionArea(areaId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionAreaUdo) =>
      inspectionApi.updateArea(areaId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteInspectionArea() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (areaId: string) => inspectionApi.deleteArea(areaId),
    onSuccess: () => invalidate(),
  });
}

export function useCreateInspectionVisit() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionVisitCdo) =>
      inspectionApi.createVisit(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionVisit(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionVisitUdo) =>
      inspectionApi.updateVisit(visitId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionVisitStatus(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (status: InspectionStatus) =>
      inspectionApi.updateVisitStatus(visitId, status),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteInspectionVisit() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (visitId: string) => inspectionApi.deleteVisit(visitId),
    onSuccess: () => invalidate(),
  });
}

export function useReorderInspectionVisitProperties(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (items: OrderItem[]) =>
      inspectionApi.reorderVisitProperties(visitId, items),
    onSuccess: () => invalidate(),
  });
}

export function useReorderInspectionVisitImages(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (items: OrderItem[]) =>
      inspectionApi.reorderVisitImages(visitId, items),
    onSuccess: () => invalidate(),
  });
}

export function useCreateInspectionProperty(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: ViewedPropertyCdo) =>
      inspectionApi.createProperty(visitId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionProperty(
  visitId: string,
  propertyId: string
) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: ViewedPropertyUdo) =>
      inspectionApi.updateProperty(visitId, propertyId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionPropertyStatus(
  visitId: string,
  propertyId: string
) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (status: InspectionStatus) =>
      inspectionApi.updatePropertyStatus(visitId, propertyId, status),
    onSuccess: () => invalidate(),
  });
}

export function useSaveInspectionPropertyAnswers(
  visitId: string,
  propertyId: string
) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (answers: PropertyAnswerPayload[]) =>
      inspectionApi.savePropertyAnswers(visitId, propertyId, answers),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteInspectionProperty(visitId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (propertyId: string) =>
      inspectionApi.deleteProperty(visitId, propertyId),
    onSuccess: () => invalidate(),
  });
}

export function useCreateInspectionQuestion() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionQuestionCdo) =>
      inspectionApi.createQuestion(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionQuestionContent(questionId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionQuestionContentUdo) =>
      inspectionApi.updateQuestionContent(questionId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionQuestionPolicy(questionId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (payload: InspectionQuestionPolicyUdo) =>
      inspectionApi.updateQuestionPolicy(questionId, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateInspectionQuestionStatus(questionId: string) {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      inspectionApi.updateQuestionStatus(questionId, enabled),
    onSuccess: () => invalidate(),
  });
}

export function useReorderInspectionQuestions() {
  const invalidate = useInvalidateInspection();
  return useMutation({
    mutationFn: (items: OrderItem[]) => inspectionApi.reorderQuestions(items),
    onSuccess: () => invalidate(),
  });
}
