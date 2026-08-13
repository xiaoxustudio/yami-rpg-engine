import { Variable } from './variable.ts';
import { getVariableStore } from '@app/stores/variable';
import type { VariableItemShape } from '@app/stores/variable';

Variable.saveHistory = function (item: unknown, key: string, value: unknown) {
	getVariableStore().saveHistory(item as VariableItemShape, key, value);
};
