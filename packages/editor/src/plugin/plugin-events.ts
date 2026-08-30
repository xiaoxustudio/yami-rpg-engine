import { PluginManager } from './plugin.ts';
import type { ParameterShape, PluginMetaShape } from './plugin.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import { clear } from '@app/utils/element-utils.ts';
import { Window } from '@app/tools/window-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import type { TreeListElement } from '@app/components/tree-list.ts';

PluginManager.checkValidate = function (
	this: typeof PluginManager,
	parameter: ParameterShape,
	value: unknown
) {
	if (!parameter.validate) return true;
	const v = parameter.validate;
	if (v.notEmpty && (value === '' || value == null)) return false;
	if (v.minLength != null && typeof value === 'string' && value.length < v.minLength)
		return false;
	if (v.maxLength != null && typeof value === 'string' && value.length > v.maxLength)
		return false;
	if (v.pattern && typeof value === 'string' && !v.pattern.test(value)) return false;
	return true;
} as unknown as ((...args: unknown[]) => boolean) | null;

PluginManager.saveToProject = function (this: typeof PluginManager, project: EditorProjectShape) {
	const { plugin } = project;
	plugin!.detailed = this.detailed;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.loadFromProject = function (this: typeof PluginManager, project: EditorProjectShape) {
	const { plugin } = project;
	this.detailed = plugin!.detailed!;
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.windowClose = function (this: typeof PluginManager, event: Event) {
	if (this.changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		Window.confirm!(
			{
				message: get('closeUnsavedPlugins')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('plugin');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

PluginManager.windowClosed = function (this: typeof PluginManager, _event: Event) {
	(this.list as TreeListElement).saveSelection();
	this.data = null;
	clear(this.list);
	window.removeEventListener('keydown', this.keydown!);
	window.removeEventListener('pointerdown', this.pointerdown!);
	window.removeEventListener('script-change', this.scriptChange!);
}.bind(PluginManager) as unknown as ((...args: unknown[]) => void) | null;

PluginManager.keydown = function (this: typeof PluginManager, event: KeyboardEvent) {
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyD':
				PluginManager.switchOverviewMode!();
				break;
		}
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.pointerdown = function (this: typeof PluginManager, event: PointerEvent) {
	// 阻止鼠标在窗口外部双击会选中概述内容的行为 并且调用失去焦点方法避免阻止后失效
	if (event.target === document.documentElement) {
		event.preventDefault();
		document.activeElement!.blur();
	}
} as unknown as ((...args: unknown[]) => void) | null;

PluginManager.scriptChange = function (
	this: typeof PluginManager,
	event: Event & { changedMeta?: PluginMetaShape }
) {
	if (PluginManager.meta === event.changedMeta) {
		PluginManager.loadOverview!();
	}
} as unknown as ((...args: unknown[]) => void) | null;
