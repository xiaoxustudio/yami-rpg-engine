import { controlRoot, type ControlApi } from '@app/composables/control-refs';

/** 控件表：id → 控件实例（`defineExpose`）。由窗口用 `useControlRefs` 建表后整表传入。 */
export type CallEventFieldTable = Partial<Record<string, ControlApi | null>>;

/**
 * callEvent 表单的字段选项 / 联动配置（原 `CallEvent.vue` 的 `onMounted` 大块）。
 *
 * 入参是**控件表**而不是注册表：函数不认识 id 的存放位置，也不再按 id 去全局找元素。
 * `relate()` 的 targets 是 DOM 语义（`select-box-core` 要读写元素样式与兄弟标签），
 * 所以那一处仍用 `controlRoot(...)` 取根元素。
 *
 * `t` 由窗口传进来（窗口拿的是 `useI18n()` 的局部 `t`，figure 文案要跟着组件树走）。
 */
export function setupCallEventFields(
	fields: CallEventFieldTable,
	t: (key: string) => string
): void {
	const type = fields['callEvent-type'];
	type?.loadItems?.([
		{ name: 'Global', value: 'global' },
		{ name: t('command.callEvent.inherited') || 'Inherited', value: 'inherited' },
		{ name: t('command.callEvent.scene') || 'Scene', value: 'scene' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' }
	]);
	type?.enableHiddenMode?.();
	// `enableHiddenMode` 返回 `unknown`（刻意不参与链式调用），所以拆成两句
	(type as { relate?: (list: unknown[]) => void } | null)?.relate?.([
		{ case: 'global', targets: [controlRoot(fields['callEvent-eventId'])] },
		{ case: 'scene', targets: [controlRoot(fields['callEvent-eventType'])] },
		{
			case: 'actor',
			targets: [
				controlRoot(fields['callEvent-actor']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'skill',
			targets: [
				controlRoot(fields['callEvent-skill']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'state',
			targets: [
				controlRoot(fields['callEvent-state']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'equipment',
			targets: [
				controlRoot(fields['callEvent-equipment']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'item',
			targets: [
				controlRoot(fields['callEvent-item']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'light',
			targets: [
				controlRoot(fields['callEvent-light']),
				controlRoot(fields['callEvent-eventType'])
			]
		},
		{
			case: 'element',
			targets: [
				controlRoot(fields['callEvent-element']),
				controlRoot(fields['callEvent-eventType'])
			]
		}
	]);
}
