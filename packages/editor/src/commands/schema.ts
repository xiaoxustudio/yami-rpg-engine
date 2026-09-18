/* oxlint-disable typescript/unbound-method */
import { $ } from '@app/utils/dom';
import { markRaw } from 'vue';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, on, read, write } from '@app/utils/element-utils';
import { reportError } from '@app/utils/safe';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { AncestorGetter } from '@app/commands/accessors/ancestor-accessor-window.ts';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window.ts';
import { Command, bindCommandSchema } from '@app/commands/command-object.ts';
import { commandCases } from '@app/commands/command-registry.ts';
import { CommandSuggestion } from '@app/commands/command-tip.ts';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { LightGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import { Token } from '@app/commands/token.ts';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { RegionGetter } from '@app/commands/accessors/region-accessor-window.ts';
import { ObjectGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { TextSuggestion } from '@app/commands/text-tip.ts';
import { TilemapGetter } from '@app/commands/accessors/tilemap-accessor-window.ts';
import { TriggerGetter } from '@app/commands/accessors/trigger-accessor-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

interface CommandField {
	key: string;
	domId?: string;
	required?: boolean;
	default?: unknown;
	[k: string]: unknown;
}

type CommandContent = Record<string, unknown>;

interface CommandTarget {
	scrollAndResize?: () => void;
	getSelectionPosition?: () => { x: number; y: number } | null;
}

interface CommandRecord {
	id: string;
	params?: Record<string, unknown>;
}

interface CommandSchemaConfig {
	name: string;
	fields?: CommandField[];
	children?: boolean;
	confirmId?: string;
	onParse?(data: Record<string, unknown>, contents: CommandContent[]): void;
	onLoad?(data: Record<string, unknown>): void;
	onSave?(data: Record<string, unknown>): void;
	onInitialize?: () => void;
	initialize?: () => void;
	parse?(data: Record<string, unknown>): CommandContent[];
	customParse?(data: Record<string, unknown>): CommandContent[];
	load?(data: Record<string, unknown>): void;
	customLoad?(data: Record<string, unknown>): void;
	save?: () => unknown;
	customSave?: () => unknown;
	noWindow?: boolean;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export class CommandSchema {
	name: string;
	fields: CommandField[];
	children: boolean;
	confirmId: string;
	onParse;
	onLoad;
	onSave;
	onInitialize;
	customParse;
	customLoad;
	customSave;
	noWindow;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;

	constructor(config: CommandSchemaConfig) {
		this.name = config.name;
		this.fields = config.fields ?? [];
		this.children = config.children ?? false;
		this.confirmId = config.confirmId ?? `${config.name}-confirm`;
		// oxlint-disable-next-line unbound-method
		this.onParse = config.onParse;
		// oxlint-disable-next-line unbound-method
		this.onLoad = config.onLoad;
		// oxlint-disable-next-line unbound-method
		this.onSave = config.onSave;
		this.onInitialize = config.initialize ?? config.onInitialize;
		// oxlint-disable-next-line unbound-method
		this.customParse = config.parse ?? config.customParse;
		// oxlint-disable-next-line unbound-method
		this.customLoad = config.load ?? config.customLoad;
		this.customSave = config.save ?? config.customSave;
		this.noWindow = config.noWindow ?? false;
		const reserved = new Set([
			'name',
			'fields',
			'children',
			'confirmId',
			'onParse',
			'onLoad',
			'onSave',
			'initialize',
			'onInitialize',
			'parse',
			'customParse',
			'load',
			'customLoad',
			'save',
			'customSave',
			'noWindow'
		]);
		for (const key of Object.keys(config)) {
			if (reserved.has(key) || key in this) {
				continue;
			}
			this[key] = config[key];
		}
		if (this.noWindow) {
			this.load = null as unknown as (...args: unknown[]) => unknown;
			this.initialize = null as unknown as () => boolean;
		}
	}

	// 取字段默认值（支持函数延迟求值）
	_getDefault(field: CommandField) {
		return typeof field.default === 'function' ? field.default() : field.default;
	}

	createDefault() {
		const data: Record<string, unknown> = {};
		for (const field of this.fields) {
			const value = this._getDefault!(field);
			if (value !== undefined) {
				data[field.key] = value;
			}
		}
		return data;
	}

	initialize(): boolean {
		if (this.onInitialize) {
			this.onInitialize!();
			return true;
		}
		const confirm = $(`#${this.confirmId}`);
		if (!confirm) {
			return false;
		}
		on(confirm, 'click', () => this.save!());
		return true;
	}

	parse(data: Record<string, unknown>) {
		if (this.customParse) {
			return this.customParse!(data);
		}
		const alias = t(`command.${this.name}.alias`);
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: (alias ?? this.name) + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' }
		];
		if (this.onParse) {
			this.onParse!(data, contents);
		}
		return contents;
	}

	load(data: Record<string, unknown>) {
		if (this.customLoad) {
			return this.customLoad!(data);
		}
		for (const field of this.fields) {
			const value = data[field.key] ?? this._getDefault!(field);
			write($(`#${this.name}-${field.domId ?? field.key}`), value);
		}
		if (this.onLoad) {
			this.onLoad!(data);
		}
	}

	save() {
		if (this.customSave) {
			return this.customSave!();
		}
		const data: Record<string, unknown> = {};
		let focusTarget = null;
		for (const field of this.fields) {
			const value = read($(`#${this.name}-${field.domId ?? field.key}`));
			if (field.required && (value === '' || value === undefined)) {
				focusTarget = $(`#${this.name}-${field.domId ?? field.key}`);
				break;
			}
			data[field.key] = value;
		}
		if (focusTarget) {
			return getFocus(focusTarget);
		}
		if (this.onSave) {
			this.onSave!(data);
		}
		Command.save?.(data);
	}

	// --- 静态分发方法 ---

	static _resolve(id: string) {
		return commandCases[id];
	}

	static _topoSort(names: string[], getDeps: (name: string) => string[]) {
		const graph: Map<string, string[]> = new Map(names.map((n: string) => [n, []]));
		const inDegree: Map<string, number> = new Map(names.map((n: string) => [n, 0]));
		for (const name of names) {
			for (const dep of getDeps(name) ?? []) {
				if (!graph.has(dep)) continue;
				graph.get(dep)!.push(name);
				inDegree.set(name, inDegree.get(name)! + 1);
			}
		}
		const queue = names.filter((n: string) => inDegree.get(n) === 0);
		const result = [];
		while (queue.length) {
			const node = queue.shift()!;
			result.push(node);
			for (const next of graph.get(node)!) {
				inDegree.set(next, inDegree.get(next)! - 1);
				if (inDegree.get(next) === 0) queue.push(next);
			}
		}
		return result;
	}

	static initAll() {
		Command.words = markRaw(new Command.WordList());
		const subMap: Record<
			string,
			{ dependsOn?: string[]; initialize: (() => boolean | void) | null }
		> = {
			CommandSuggestion,
			TextSuggestion,
			VariableGetter,
			ActorGetter,
			SkillGetter,
			StateGetter,
			EquipmentGetter,
			ItemGetter,
			PositionGetter,
			AngleGetter,
			TriggerGetter,
			LightGetter,
			RegionGetter,
			TilemapGetter,
			ObjectGetter,
			ElementGetter,
			AncestorGetter
		};
		const sorted = CommandSchema._topoSort(
			Object.keys(subMap),
			(name: string) => subMap[name].dependsOn ?? []
		);
		const retry: (() => void)[] = [];
		for (const name of sorted) {
			try {
				if (subMap[name].initialize!() === false) {
					retry.push(() => subMap[name].initialize!());
				}
			} catch (error) {
				console.error(`[initAll] ${name} initialize failed:`, error);
				retry.push(() => subMap[name].initialize!());
			}
		}
		try {
			Command.custom.initialize();
		} catch (error) {
			console.error('[initAll] Command.custom initialize failed:', error);
		}
		for (const [caseName, object] of Object.entries(commandCases)) {
			try {
				if (object.initialize?.() === false) {
					retry.push(() => object.initialize?.());
				}
			} catch (error) {
				console.error(`[initAll] command case "${caseName}" initialize failed:`, error);
				retry.push(() => object.initialize?.());
			}
		}
		setTimeout(() => {
			for (const fn of retry) {
				try {
					fn();
				} catch (error) {
					console.error('[initAll] retry failed:', error);
				}
			}
		}, 2000);
	}

	/**
	 * 打开指令窗口并把参数灌进去（`insert` / `edit` 共用）。
	 *
	 * `point`（活动行的屏幕位置）**只用于定位**窗口：拿不到时退回当前定位模式，
	 * 不再"静默不打开"。行改由模板渲染后，活动行可能尚未物化（`scrollAndResize` 改了窗口，
	 * 而模板要等 Vue 一拍），旧实现会因此什么都不做——用户看到的就是"双击没反应"。
	 */
	static openWindow(
		target: CommandTarget | null | undefined,
		windowId: string,
		load: () => void
	): void {
		target?.scrollAndResize?.();
		const point = target?.getSelectionPosition?.();
		if (point) {
			Window.setPositionMode!('absolute');
			Window.absolutePos.x = point.x + 100;
			Window.absolutePos.y = point.y;
		}
		Window.open!(windowId);
		if (point) {
			Window.setPositionMode!('overlap');
		}
		load();
	}

	static insert(target: CommandTarget, id: string) {
		Command.target = target;
		if (id) {
			target?.scrollAndResize?.();
			return CommandSchema.open(id);
		}
		CommandSuggestion.open?.();
	}

	static open(id: string) {
		const handler = CommandSchema._resolve(id);
		if (handler !== undefined) {
			Command.id = id;
			if (handler.load) {
				CommandSchema.openWindow(Command.target, id, () => handler.load!({}));
			} else {
				handler.save();
			}
			return;
		}
		const meta = Data.scripts[id];
		if (meta !== undefined) {
			Command.id = id;
			if (meta.parameters.length !== 0) {
				// 参数面板由 `Command.custom.load` 按脚本参数描述现场生成，与指令名表无关 ⇒ 不再以
				// `commandNameMap` 为门槛（它只提供窗口标题，缺失时退回指令 id）。
				CommandSchema.openWindow(Command.target, 'scriptCommand', () =>
					Command.custom.load(id, {})
				);
			} else {
				Command.custom.save();
			}
			return;
		}
		console.warn(`[command] 未定义的指令 id：${id}`);
	}

	static edit(target: CommandTarget, command: CommandRecord) {
		const { id, params } = command;
		const handler = CommandSchema._resolve(id);
		if (handler?.load instanceof Function) {
			Command.target = target;
			Command.id = id;
			CommandSchema.openWindow(target, id, () => handler.load(params!));
			return;
		}
		if (handler) {
			// 有内置定义但没有参数窗口（`noWindow`：无参数、插入即生效）⇒ 客观上没有可编辑内容
			console.warn(`[command] "${id}" 没有参数窗口（noWindow），双击无可编辑内容`);
			return;
		}
		const meta = Data.scripts[id];
		if (meta === undefined) {
			console.warn(`[command] 无法编辑 "${id}"：既不是内置指令，也不是脚本指令`);
			return;
		}
		if (meta.parameters.length === 0) {
			console.warn(`[command] "${id}" 是没有参数的脚本指令，双击无可编辑内容`);
			return;
		}
		Command.target = target;
		Command.id = id;
		CommandSchema.openWindow(target, 'scriptCommand', () => Command.custom.load(id, params!));
	}

	static save(params: Record<string, unknown>) {
		const { id, target } = Command;
		target?.save?.({ id, params });
		const handler = CommandSchema._resolve(id);
		if (handler !== undefined) {
			if (!handler.noWindow) Window.close!(id);
		} else {
			Window.close!('scriptCommand');
		}
	}

	static parse(command: CommandRecord | null, varMap: Record<string, unknown>) {
		Command.varMap = varMap;
		let id = command?.id;
		if (id == null) {
			Command.invalid = true;
			reportError(new Error('指令缺少 id'), 'CommandSchema.parse');
			return '';
		}
		if (id[0] === '!') {
			id = id.slice(1);
		}
		Command.invalid = false;
		const params = command!.params ?? {};
		const handler = CommandSchema._resolve(id);
		try {
			const contents = handler ? handler.parse(params) : Command.custom.parse(id, params);
			return Command.parseTextTags?.(contents);
		} catch (err) {
			Command.invalid = true;
			reportError(err, `CommandSchema.parse (id=${id})`);
			return `[解析失败: ${id}]`;
		}
	}
}

bindCommandSchema(CommandSchema);
