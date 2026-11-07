import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { controlRoot, type ControlApi } from '@app/composables/control-refs';

/** 控件表：id → 控件实例（`defineExpose`）。由窗口用 `useControlRefs` 建表后整表传入。 */
export type SetBooleanFieldTable = Partial<Record<string, ControlApi | null>>;

/**
 * setBoolean 命令表单的字段选项 / 联动配置（原 `SetBoolean.vue` 的 `onMounted` 大块）。
 *
 * 入参是**控件表**而不是注册表：函数不认识 id 的存放位置，也不再按 id 去全局找元素，
 * 于是它可以脱离窗口单测，`element-registry-lookups` 也不再从这里长出来。
 * `relate()` 的 targets 是 DOM 语义（`select-box-core` 要读写元素样式与兄弟标签），
 * 所以那一处仍用 `controlRoot(...)` 取根元素。
 */
export function setupSetBooleanFields(fields: SetBooleanFieldTable): void {
	useLocalizedOptions('setBoolean-operation', ['set', 'not', 'and', 'or', 'xor'], (items) =>
		fields['setBoolean-operation']?.loadItems?.(items)
	);
	useLocalizedOptions(
		'setBoolean-operand-type',
		['constant', 'variable', 'list', 'parameter', 'script'],
		(items) => fields['setBoolean-operand-type']?.loadItems?.(items)
	);
	const type = fields['setBoolean-operand-type'];
	type?.enableHiddenMode?.();
	// `enableHiddenMode` 返回 `unknown`（刻意不参与链式调用），所以拆成两句
	(type as { relate?: (list: unknown[]) => void } | null)?.relate?.([
		{
			case: 'constant',
			targets: [controlRoot(fields['setBoolean-constant-value'])]
		},
		{
			case: 'variable',
			targets: [controlRoot(fields['setBoolean-common-variable'])]
		},
		{
			case: 'list',
			targets: [
				controlRoot(fields['setBoolean-common-variable']),
				controlRoot(fields['setBoolean-list-index'])
			]
		},
		{
			case: 'parameter',
			targets: [controlRoot(fields['setBoolean-parameter-key'])]
		},
		{ case: 'script', targets: [controlRoot(fields['setBoolean-script'])] }
	]);
	fields['setBoolean-constant-value']?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
}
