import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { AddressCandidate } from '@/domains/geo/api/geo-schemas';
import { AddressSearchField } from '@/domains/geo/components/AddressSearchField';
import {
  classifyLocationError,
  describeLocationError,
} from '@/domains/geo/utils/location-error';
import {
  useCreateInspectionProperty,
  useInspectionComplexNames,
} from '@/domains/inspection/hooks/inspection-queries';
import type { PropertyLocationInput } from '@/domains/inspection/types';
import { buildDeviceInspectionPropertyEditPath } from '@/lib/routing/route-builders';

type AddPropertyFormProps = {
  device: DeviceType;
  /** Undefined while the owning visit is still loading. */
  areaId: string | undefined;
  visitId: string;
  /** Appended to the edit path so that screen knows where to return. */
  editSearch?: string;
  triggerClassName?: string;
};

/**
 * A property can be created with just its complexName (name = 동·호수 is
 * optional until it is completed), so "매물 추가" collects those two inline,
 * creates the property, and hands off to ③-1 매물 편집 for everything else.
 */
export function AddPropertyForm({
  device,
  areaId,
  visitId,
  editSearch = '',
  triggerClassName,
}: AddPropertyFormProps) {
  const navigate = useNavigate();
  const createPropertyMutation = useCreateInspectionProperty(visitId);
  const [isAdding, setIsAdding] = useState(false);
  // Only fetch suggestions once the form is actually open.
  const complexNamesQuery = useInspectionComplexNames(
    isAdding ? visitId : undefined,
    'AREA'
  );
  const datalistId = useId();

  const [newComplexName, setNewComplexName] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [location, setLocation] = useState<PropertyLocationInput | null>(null);
  // Set after a location failure: the POST was refused, so ask before
  // dropping the chosen address (06-fe-plan §4.2).
  const [locationFailure, setLocationFailure] = useState<string | null>(null);
  const [isAddressDisabled, setIsAddressDisabled] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [focusAddressRequested, setFocusAddressRequested] = useState(false);

  useEffect(() => {
    if (focusAddressRequested && !location) {
      addressInputRef.current?.focus();
      setFocusAddressRequested(false);
    }
  }, [focusAddressRequested, location]);

  function handleSelectAddress(candidate: AddressCandidate) {
    setLocationFailure(null);
    setLocation({
      bdMgtSn: candidate.bdMgtSn,
      roadAddress: candidate.roadAddress ?? candidate.jibunAddress ?? '',
      coordKey: candidate.coordKey,
    });
    if (!newComplexName.trim() && candidate.buildingName) {
      setNewComplexName(candidate.buildingName);
    }
  }

  async function handleAddProperty(withLocation: PropertyLocationInput | null) {
    if (!newComplexName.trim()) {
      setAddError('단지명을 입력해 주세요.');

      return;
    }

    setAddError(null);
    setLocationFailure(null);

    try {
      const created = await createPropertyMutation.mutateAsync({
        complexName: newComplexName.trim(),
        name: newName.trim() || undefined,
        ...(withLocation ? { location: withLocation } : {}),
      });

      if (areaId) {
        navigate(
          `${buildDeviceInspectionPropertyEditPath(
            device,
            areaId,
            visitId,
            created.propertyId
          )}${editSearch}`
        );
      }
    } catch (error) {
      const kind = classifyLocationError(error, {
        requestHadNewLocation: Boolean(withLocation),
      });

      if (withLocation && (kind === 'location' || kind === 'unavailable')) {
        // Never retried automatically; inputs stay as they are.
        setLocationFailure(describeLocationError(error));
        if (kind === 'unavailable') {
          setIsAddressDisabled(true);
        }

        return;
      }

      setAddError('매물을 추가하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  }

  if (!isAdding) {
    return (
      <Button
        variant='ghost'
        className={triggerClassName}
        onClick={() => setIsAdding(true)}
      >
        + 매물 추가
      </Button>
    );
  }

  return (
    <div className='slcn-inspection-register-add-property'>
      <TextField
        label='단지/건물명'
        required
        list={datalistId}
        value={newComplexName}
        onChange={(event) => setNewComplexName(event.target.value)}
        hint='같은 이름이어야 회차 간 매물이 연결됩니다.'
      />
      <datalist id={datalistId}>
        {(complexNamesQuery.data ?? []).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <TextField
        label='동·호수'
        hint='임장 전이라면 비워 둘 수 있어요.'
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
      />
      <AddressSearchField
        ref={addressInputRef}
        label='주소 (선택)'
        value={location}
        disabled={isAddressDisabled}
        onSelect={handleSelectAddress}
        onClear={() => {
          setLocation(null);
          setLocationFailure(null);
        }}
      />
      {locationFailure ? (
        <div role='alert' className='slcn-inspection-register-step__error'>
          <p>주소를 저장하지 못했습니다. 위치 없이 등록할까요?</p>
          <p>{locationFailure}</p>
          <p>위치는 나중에 매물 수정 화면에서 다시 넣을 수 있어요.</p>
          <div className='slcn-inspection-register-add-property__actions'>
            <Button
              variant='secondary'
              loading={createPropertyMutation.isPending}
              onClick={() => void handleAddProperty(null)}
            >
              위치 없이 등록
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                setLocation(null);
                setLocationFailure(null);
                setFocusAddressRequested(true);
              }}
            >
              다른 주소 고르기
            </Button>
          </div>
        </div>
      ) : null}
      {addError ? (
        <p className='slcn-inspection-register-step__error' role='alert'>
          {addError}
        </p>
      ) : null}
      <div className='slcn-inspection-register-add-property__actions'>
        <Button
          variant='ghost'
          onClick={() => {
            setIsAdding(false);
            setAddError(null);
            setLocation(null);
            setLocationFailure(null);
          }}
        >
          취소
        </Button>
        <Button
          loading={createPropertyMutation.isPending}
          onClick={() => void handleAddProperty(location)}
        >
          추가하고 계속 쓰기
        </Button>
      </div>
    </div>
  );
}
