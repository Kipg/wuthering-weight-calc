import type { CritInput, CritMode } from '../../types';
import { CRIT_MODE_OPTIONS } from '../../types';
import { Card } from '../ui/Card';
import { FormSelect } from '../ui/FormSelect';

interface Props {
  crit: CritInput;
  onChange: (patch: Partial<CritInput>) => void;
}

export function CritSection({ crit, onChange }: Props) {
  return (
    <Card title="暴击区" borderColor="purple">
      <FormSelect
        label="暴击模式"
        value={crit.critMode}
        options={CRIT_MODE_OPTIONS}
        onChange={v => onChange({ critMode: v as CritMode })}
      />
    </Card>
  );
}
