import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type {
	IfConditionData,
	IfConditionForm,
	IfConditionShape,
	IfConditionTarget
} from '@app/composables/useIfConditionSchema';

declare global {
	type SwitchConditionData = {
		type:
			| 'none'
			| 'boolean'
			| 'number'
			| 'string'
			| 'attribute'
			| 'enum'
			| 'keyboard'
			| 'gamepad'
			| 'mouse'
			| 'variable';
		value?: string | number | boolean;
		attributeId?: string;
		stringId?: string;
		keycode?: string;
		button?: number;
		variable?: { type: string; key: string };
	};
}

export type { IfConditionData, IfConditionForm, IfConditionShape, IfConditionTarget };
export const IfCondition = useIfConditionSchema();
