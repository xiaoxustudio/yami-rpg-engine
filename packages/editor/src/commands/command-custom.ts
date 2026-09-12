import { createElementRegistry } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { clear, getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';

import { CommandSuggestion, CommandSuggestionItem } from './command-tip.ts';
import { Token } from '@app/commands/token.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { PluginManager } from '@app/plugin/plugin.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

const Layout = getLazyWindow('layout', () =>
	import('@app/tools/window-cluster').then((m) => m.Layout)
);

interface CustomParameter {
	type: string;
	key: string;
	options?: unknown[];
	dataItems?: Array<{ name: string }>;
}

interface CustomFolder {
	class: 'folder';
	value: string;
	expanded?: boolean;
	children: CustomCommandItem[] | null;
}

interface CustomCommandItem {
	class: 'custom';
	value: string;
	name: string;
	desc?: string;
	keywords?: string;
	unspacedName?: string;
}

interface ScriptObject {
	id: string;
	parameters: Record<string, unknown> | null;
}

type WordListInstance = Array<string> & {
	push(s: string): number;
	join(j?: string): string;
};

interface ParameterWrapBox extends HTMLElement {
	wrap: ParameterWrap;
	meta: unknown;
	data: unknown;
}

interface ParameterWrap {
	box: ParameterWrapBox;
	grid: HTMLElement;
	children: unknown[];
}

interface ParameterPane extends HTMLElement {
	getData: () => ScriptObject[];
	onResize: () => void;
	createDetailBox: () => ParameterWrap;
	clear: () => void;
	metas: unknown[];
	wraps: ParameterWrap[];
	recycle(node: unknown): void;
	update(): void;
	querySelector(selector: string): HTMLElement | null;
	scriptChange: (event: Event) => void;
}

/** P5b 批次 2：脚本命令窗口的元素注册表——由 `ScriptCommand.vue` 在模板里登记 */
export const scriptCommandEls = createElementRegistry();

Command.custom = {
	customFolder: null as CustomFolder | null,
	commandNameMap: null as Record<string, string> | null,
	windowX: null as number | null,
	windowY: null as number | null,
	parsingScript: { id: '', parameters: null } as ScriptObject,
	loadedScript: { id: '', parameters: null } as ScriptObject,
	// P5b 批次 2：这些元素由 ScriptCommand.vue 在模板里登记，initialize() 时从注册表取
	windowFrame: null as unknown as HTMLElement & {
		style: CSSStyleDeclaration;
		absolute(x: number | null, y: number | null): void;
		setTitle(title: string): void;
		addEventListener(type: string, listener: (event: Event) => void): void;
	},
	parameterPane: null as unknown as ParameterPane,
	parameterGrid: null as unknown as HTMLElement,

	initialize: function (): void {
		window.addEventListener('localize', this.windowLocalize);

		this.windowFrame = scriptCommandEls.get('scriptCommand') as unknown as HTMLElement & {
			style: CSSStyleDeclaration;
			absolute(x: number | null, y: number | null): void;
			setTitle(title: string): void;
			addEventListener(type: string, listener: (event: Event) => void): void;
		};
		this.parameterPane = scriptCommandEls.get(
			'scriptCommand-parameter-pane'
		) as unknown as ParameterPane;
		this.parameterGrid = scriptCommandEls.get('scriptCommand-parameter-grid') as HTMLElement;

		if (!this.parameterPane) return;
		const scriptList: ScriptObject[] = [this.loadedScript];
		this.parameterPane.getData = () => scriptList;

		const grid = this.parameterGrid;
		this.parameterPane.onResize = () => {
			const height = grid.clientHeight;
			this.windowFrame.style.height = `${height + 78}px`;
			// 如果窗口被拖动过会重置位置，不过影响不大
			this.windowFrame.absolute(this.windowX, this.windowY);
		};

		const box = scriptCommandEls.get('scriptCommand-parameter-detail') as ParameterWrapBox;
		const wrap = { box, grid, children: [] } as ParameterWrap;
		box.wrap = wrap;
		this.parameterPane.createDetailBox = function (): ParameterWrap {
			return wrap;
		};

		this.parameterPane.clear = function (this: ParameterPane): void {
			this.metas = [];
			const { wraps } = this;
			if (wraps.length !== 0) {
				const { children, box } = wraps[0];
				let i = children.length;
				while (--i >= 0) {
					this.recycle(children[i]);
				}
				box.meta = null;
				box.data = null;
				children.length = 0;
				wraps.length = 0;
			}
			window.removeEventListener('script-change', this.scriptChange);
		};

		this.windowFrame.addEventListener('closed', (_event: Event) => {
			this.loadedScript.parameters = null;
			clear(this.parameterPane);
		});
	},

	parse: function (id: string, parameters: Record<string, unknown>): Record<string, unknown>[] {
		const meta = Data.scripts[id];
		const name = this.commandNameMap![id];
		if (meta === undefined || name === undefined) {
			const label = t('command.invalidCommand');
			const cmdId = Command.parseUnlinkedId!(id);
			return [{ color: 'invalid' }, { text: `${label}: ${cmdId}` }];
		}
		const script = this.parsingScript;
		script.id = id;
		script.parameters = parameters;
		PluginManager.reconstruct(script);
		parameters = script.parameters!;
		script.parameters = null;
		const mParameters = meta.parameters as CustomParameter[];
		if (mParameters.length === 0) {
			return [{ color: 'custom' }, { text: name }];
		}
		const words = Command.words as unknown as WordListInstance;
		const states = meta.manager.states;
		for (const parameter of mParameters) {
			const { type, key } = parameter;
			const value = parameters[key];
			if (states[key] === false) {
				continue;
			}
			switch (type) {
				case 'boolean':
					words.push(Command.setBooleanColor!(value));
					continue;
				case 'number':
					words.push(Command.setNumberColor!(value));
					continue;
				case 'variable-number':
					words.push(Command.parseVariableNumber!(value));
					continue;
				case 'string':
					// oxlint-disable-next-line no-base-to-string
					words.push(Command.setStringColor!(`"${String(value)}"`));
					continue;
				case 'option': {
					const index = parameter.options!.indexOf(value);
					if (index !== -1) {
						const { name } = parameter.dataItems![index];
						words.push(meta.langMap.update().get(name));
					}
					continue;
				}
				case 'easing':
					words.push(
						(Data.easings.map as Record<string, { name: string }>)[value as string].name
					);
					continue;
				case 'team':
					words.push(
						(Data.teams.map as Record<string, { name: string }>)[value as string].name
					);
					continue;
				case 'variable':
					words.push(
						value
							? Command.parseVariable!({ type: 'global', key: value }, 'any')
							: Token('none')
					);
					continue;
				case 'attribute':
					words.push(Command.parseAttributeKey!('', value, 'object'));
					continue;
				case 'attribute-key':
					words.push(Command.parseAttributeKey!('', value, 'string'));
					continue;
				case 'attribute-group':
					words.push(Command.parseAttributeGroup!(value));
					continue;
				case 'enum':
				case 'enum-value':
					words.push(Command.parseEnumString!(value));
					continue;
				case 'enum-group':
					words.push(Command.parseEnumGroup!(value));
					continue;
				case 'file':
				case 'image':
				case 'audio':
					words.push(Command.parseFileName!(value));
					continue;
				case 'variable-getter':
				case 'variable-setter':
					words.push(Command.parseVariable!(value, 'any'));
					continue;
				case 'actor-getter':
					words.push(Command.parseActor!(value));
					continue;
				case 'skill-getter':
					words.push(Command.parseSkill!(value));
					continue;
				case 'state-getter':
					words.push(Command.parseState!(value));
					continue;
				case 'equipment-getter':
					words.push(Command.parseEquipment!(value));
					continue;
				case 'item-getter':
					words.push(Command.parseItem!(value));
					continue;
				case 'element-getter':
					words.push(Command.parseElement!(value));
					continue;
				case 'position-getter':
					words.push(Command.parsePosition!(value));
					continue;
				case 'number[]': {
					const numbers: (number | string)[] = (value as number[]).slice(0, 5);
					for (let i = 0; i < numbers.length; i++) {
						numbers[i] = Command.setNumberColor!(
							numbers[i] as number
						) as unknown as number;
					}
					if ((value as number[]).length > 5) {
						numbers.push(Token('...'));
					}
					words.push(Token('[') + numbers.join(Token(', ')) + Token(']'));
					continue;
				}
				case 'string[]': {
					const strings: string[] = (value as string[]).slice(0, 5);
					for (let i = 0; i < strings.length; i++) {
						strings[i] = Command.setStringColor!(
							`"${Command.parseMultiLineString!(strings[i])}"`
						) as unknown as string;
					}
					if ((value as string[]).length > 5) {
						strings.push(Token('...'));
					}
					words.push(Token('[') + strings.join(Token(', ')) + Token(']'));
					continue;
				}
				case 'keycode':
					words.push(value ? Command.setStringColor!(value) : Token('null'));
					continue;
				case 'color':
					words.push(Command.parseHexColor!(value));
					continue;
			}
		}
		return [{ color: 'custom' }, { text: name + Token(': ') }, { text: words.join() }];
	},

	load: function (id: string, parameters: Record<string, unknown>): void {
		this.loadedScript.id = id;
		this.loadedScript.parameters = Object.clone(parameters);
		this.windowX = Window.absolutePos.x;
		this.windowY = Window.absolutePos.y;
		this.parameterPane.update();
		const selector = Layout.focusableSelector;
		const focusable = this.parameterPane.querySelector(selector);
		if (focusable) getFocus(focusable);
		this.windowFrame.setTitle(this.commandNameMap![id]);
	},

	save: function (): void {
		Command.save!(Command.custom.loadedScript.parameters ?? {});
	},

	loadCommandList: loadCustomCommandList,

	windowLocalize: function (_event: Event): void {
		if (Command.custom.commandNameMap) {
			void loadCustomCommandList();
		}
	}
};

export async function loadCustomCommandList(): Promise<void> {
	if (!Data.commands) return;
	const { list } = CommandSuggestion;
	if (!list) return;
	if (!Command.custom.customFolder) {
		if (list.data instanceof Promise) {
			list.data = await list.data;
		}
		(list.data as CommandSuggestionItem[]).push(
			(Command.custom.customFolder = {
				class: 'folder',
				value: 'custom',
				expanded: true,
				children: null
			})
		);
	}
	const commands: CustomCommandItem[] = [];
	const commandNameMap: Record<string, string> = {};
	for (const command of Data.commands) {
		const id = command.id;
		let meta = Data.scripts[id];
		if (meta instanceof Promise) {
			// oxlint-disable-next-line no-await-in-loop
			meta = await meta;
		}
		if (!meta || id in commandNameMap) {
			continue;
		}
		const map = meta.langMap.update();
		const name = command.alias || map.get(meta.overview.plugin) || Command.parseFileName!(id);
		commandNameMap[id] = name;
		commands.push({
			class: 'custom',
			value: id,
			name: name,
			desc: map.get(meta.overview.desc),
			keywords: command.keywords,
			unspacedName: String.compress(name)
		});
	}
	Command.custom.customFolder.children = commands;
	Command.custom.commandNameMap = commandNameMap;
	CommandSuggestion.windowLocalize!(new Event('localize'));
	TreeList.createParents(
		commands as unknown as Parameters<typeof TreeList.createParents>[0],
		Command.custom.customFolder as unknown as Parameters<typeof TreeList.createParents>[1]
	);
}
