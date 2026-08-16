import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';
import type {
	SwitchConditionData,
	SwitchConditionShape
} from '@app/composables/useSwitchConditionSchema';

export type { SwitchConditionData, SwitchConditionShape };
export const SwitchCondition = useSwitchConditionSchema();
