import { Variable } from './variable.ts';
import { getVariableStore } from '@app/stores/variable';
import type { VariableItemShape } from '@app/stores/variable';

Variable.createId = function (this: typeof Variable) {
	return getVariableStore().createId();
};

Variable.register = function (item: unknown) {
	getVariableStore().register(item as VariableItemShape);
};

Variable.unregister = function (item: unknown) {
	getVariableStore().unregister(item as VariableItemShape);
};

Variable.getVariableById = function (this: typeof Variable, id: string) {
	return getVariableStore().getVariableById(id);
};
