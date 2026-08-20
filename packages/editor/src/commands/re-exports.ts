import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type {
	IfConditionData,
	IfConditionForm,
	IfConditionShape,
	IfConditionTarget
} from '@app/composables/useIfConditionSchema';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';
import type { IfBranchData, IfBranchShape } from '@app/composables/useIfBranchSchema';
import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';
import type {
	SwitchConditionData,
	SwitchConditionShape
} from '@app/composables/useSwitchConditionSchema';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';
import type { SwitchBranchData, SwitchBranchShape } from '@app/composables/useSwitchBranchSchema';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type {
	NumberOperandData,
	NumberOperandForm,
	NumberOperandShape,
	OperandRefShape
} from '@app/composables/useNumberOperandSchema';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';
import type { ChoicesForm, ChoicesData, ChoicesShape } from '@app/composables/useChoicesSchema';

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
export type { IfBranchData, IfBranchShape };
export const IfBranch = useIfBranchSchema();
export type { SwitchConditionData, SwitchConditionShape };
export const SwitchCondition = useSwitchConditionSchema();
export type { SwitchBranchData, SwitchBranchShape };
export const SwitchBranch = useSwitchBranchSchema();
export type { NumberOperandData, NumberOperandForm, NumberOperandShape, OperandRefShape };
export const NumberOperand = useNumberOperandSchema();
export type { ChoicesForm, ChoicesData, ChoicesShape };
export const Choices = useChoicesSchema();
