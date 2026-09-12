import { reactive } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { write } from '@app/utils/element-utils';

export function commit(data: Record<string, unknown>): unknown {
	return Command.save?.(data);
}

export interface UseCommandSchemaOptions {
	onLoad?: (params: Record<string, unknown>) => void;
	skipWrite?: boolean;
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
			for (const field of fields) {
				write(composableEls.get(`${name}-${field.domId ?? field.key}`), form[field.key]);
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
