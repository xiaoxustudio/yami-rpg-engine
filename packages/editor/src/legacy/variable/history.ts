import { Variable } from './variable.ts';

Variable.saveHistory = function (item: unknown, key: string, value: unknown) {
	const type = `variable-${key}-change`;
	const history = this.history;
	const index = history.index;
	const length = history.length;
	const record = history[index];
	if (
		index !== length - 1 ||
		record === undefined ||
		record.type !== type ||
		record.item !== item
	) {
		history.save({
			type: type,
			item: item,
			value: value
		});
	}
};
