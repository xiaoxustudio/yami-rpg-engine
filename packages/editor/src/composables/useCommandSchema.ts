import { reactive } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import type { ControlApi } from '@app/composables/control-refs';
import { Command } from '@app/commands/command-object.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { write } from '@app/utils/element-utils';

export function commit(data: Record<string, unknown>): unknown {
	return Command.save?.(data);
}

/** 已提示过的「控件未就绪」id：同一条只提示一次，避免每次 edit 刷屏。 */
const warnedMissing = new Set<string>();

export interface UseCommandSchemaOptions {
	onLoad?: (params: Record<string, unknown>) => void;
	skipWrite?: boolean;
	/**
	 * 窗口的控件表（`useControlRefs` 建的那张）。给了就**按表**写控件，
	 * 不再从注册表按 `${name}-${field}` 取裸元素。
	 *
	 * 为什么必须有这条：默认写路径的 id 是拼出来的（`${name}-${field.domId ?? field.key}`），
	 * 静态清单看不见，窗口一旦迁成模板 ref，edit 路径会**静默写不进控件**（实测 WebSocketSend
	 * 三个用例直接红）。传 getter 而不是表本身：schema 在 setup 里就要拿到，而表要到挂载后才有内容。
	 */
	controls?: () => Partial<Record<string, ControlApi | null>>;
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
		if (!options.skipWrite) {
			const table = options.controls?.();
			for (const field of fields) {
				const id = `${name}-${field.domId ?? field.key}`;
				const control = table ? (table[id] ?? null) : composableEls.get(id);
				if (!control && !warnedMissing.has(id)) {
					// 兜底路径取不到控件就是「静默写不进去」：窗口还没迁表或 id 拼错都会走到这里。
					// 只提示一次（同一 id 不刷屏），并且不进生产包。
					warnedMissing.add(id);
					if (import.meta.env.DEV) {
						console.warn(
							`[useCommandSchema] ${name}: 控件未就绪，edit 路径写不进 ${id}`
						);
					}
				}
				write(control, form[field.key]);
			}
		}
		options.onLoad?.(params);
	};
	const save = (): void => {
		const data: Record<string, unknown> = {};
		for (const field of fields) {
			const value = form[field.key];
			if (field.required && (value === '' || value === undefined)) {
				return;
			}
			data[field.key] = value;
		}
		commit(data);
	};
	schema.customLoad = (params: Record<string, unknown>): void => {
		load(params);
	};
	schema.customSave = (): void => {
		save();
	};
	schema.onInitialize = (): void => {};
	return { form, load, save, commit };
}
