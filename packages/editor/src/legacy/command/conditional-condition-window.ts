import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type {
	IfConditionData,
	IfConditionForm,
	IfConditionShape,
	IfConditionTarget
} from '@app/composables/useIfConditionSchema';

export type { IfConditionData, IfConditionForm, IfConditionShape, IfConditionTarget };
export const IfCondition = useIfConditionSchema();
