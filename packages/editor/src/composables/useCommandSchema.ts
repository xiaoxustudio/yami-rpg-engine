import { reactive } from 'vue';
import { Command } from '@app/commands/command-object.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { getFocus, read, write } from '@app/utils/element-utils';

export function commit(data: Record<string, unknown>): unknown {
	return Command.save?.(data);
}

export interface UseCommandSchemaOptions {
	onLoad?: (params: Record<string, unknown>) => void;
}

export function useCommandSchema(name: string, options: UseCommandSchemaOptions = {}) {
	const schema = commandCases[name];
	const { fields } = schema;
	const form = reactive<Record<string, unknown>>({});
	const createDefault = (): Record<string, unknown> => {
		const data: Record<string, unknown> = {};
		for (const field of fields) {
			const value = typeof field.default === 'function' ? field.default() : field.default;
			if (value !== undefined) {
				data[field.key] = value;
			}
		}
		return data;
	};
	const load = (params: Record<string, unknown>): void => {
		Object.assign(form, createDefault(), params);
		for (const field of fields) {
			write(document.getElementById(`${name}-${field.domId ?? field.key}`), form[field.key]);
		}
		options.onLoad?.(params);
	};
	const save = (): void => {
		const data: Record<string, unknown> = {};
		let focusTarget: HTMLElement | null = null;
		let invalid = false;
		for (const field of fields) {
			const control = document.getElementById(`${name}-${field.domId ?? field.key}`);
			const value = form[field.key] ?? read(control);
			if (field.required && (value === '' || value === undefined)) {
				invalid = true;
				focusTarget = control;
				break;
			}
			data[field.key] = value;
		}
		if (invalid) {
			getFocus(focusTarget);
			return;
		}
		commit(data);
	};
	// 事件编辑器契约：commandCases[name].load/save 转发到 composable
	schema.customLoad = (params: Record<string, unknown>): void => {
		load(params);
	};
	schema.customSave = (): void => {
		save();
	};
	// confirm 由组件 @confirm 处理，接管 initialize 避免 initAll 重复绑定
	schema.onInitialize = (): void => {};
	return { form, load, save, commit };
}
