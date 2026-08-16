import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type {
	NumberOperandData,
	NumberOperandForm,
	NumberOperandShape,
	OperandRefShape
} from '@app/composables/useNumberOperandSchema';

export type { NumberOperandData, NumberOperandForm, NumberOperandShape, OperandRefShape };
export const NumberOperand = useNumberOperandSchema();
