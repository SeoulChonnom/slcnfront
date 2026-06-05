import { SegmentedControl } from '../../../components/ui/SegmentedControl';

type TripMapSwitcherProps = {
  activeMap: 'map1' | 'map2';
  onChange: (map: 'map1' | 'map2') => void;
  button1?: string | null;
  button2?: string | null;
};

export function TripMapSwitcher({
  activeMap,
  onChange,
  button1,
  button2,
}: TripMapSwitcherProps) {
  return (
    <SegmentedControl
      value={activeMap}
      onChange={(value) => onChange(value as 'map1' | 'map2')}
      options={[
        { label: button1 || '첫 번째 지도', value: 'map1' },
        { label: button2 || '두 번째 지도', value: 'map2' },
      ]}
    />
  );
}
