import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { controlRoot, type ControlApi } from '@app/composables/control-refs';

/** 控件表：id → 控件实例（`defineExpose`）。由窗口用 `useControlRefs` 建表后整表传入。 */
export type RegisterEventFieldTable = Partial<Record<string, ControlApi | null>>;

/**
 * registerEvent 表单的字段选项 / 联动配置（原 `RegisterEvent.vue` 的 `onMounted` 大块）。
 *
 * 入参是**控件表**而不是注册表：函数不认识 id 的存放位置，也不再按 id 去全局找元素。
 * `relate()` 的 targets 是 DOM 语义（`select-box-core` 要读写元素样式与兄弟标签），
 * 所以那一处仍用 `controlRoot(...)` 取根元素。
 */
export function setupRegisterEventFields(fields: RegisterEventFieldTable): void {
	useLocalizedOptions('registerEvent-target', ['global', 'actor', 'element'], (items) =>
		fields['registerEvent-target']?.loadItems?.(items)
	);
	const target = fields['registerEvent-target'];
	target?.enableHiddenMode?.();
	// `enableHiddenMode` 返回 `unknown`（刻意不参与链式调用），所以拆成两句
	(target as { relate?: (list: unknown[]) => void } | null)?.relate?.([
		{ case: 'actor', targets: [controlRoot(fields['registerEvent-actor'])] },
		{ case: 'element', targets: [controlRoot(fields['registerEvent-element'])] }
	]);
	useLocalizedOptions(
		'registerEvent-operation',
		['register', 'unregister', 'reset'],
		(items) => fields['registerEvent-operation']?.loadItems?.(items),
		{
			register: 'command.registerEvent.alias.register',
			unregister: 'command.registerEvent.alias.unregister',
			reset: 'command.registerEvent.alias.reset'
		}
	);
}
