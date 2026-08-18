import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import type { WordListShape } from '@app/composables/useWordList.ts';
import { commandState } from '@app/composables/useCommandState.ts';

export { commandState } from '@app/composables/useCommandState.ts';
export type { CommandState, CommandTargetShape } from '@app/composables/useCommandState.ts';

export {
	setNormalColor,
	setVariableColor,
	setGlobalVariableColor,
	setDelimiterColor,
	setOperatorColor,
	setBooleanColor,
	setNumberColor,
	setStringColor,
	setScriptColor,
	setFileColor,
	setPresetColor,
	setWeakColor,
	setCommaColors,
	setTextId,
	setTooltip,
	setClass
} from '@app/composables/useCommandColor.ts';

export { WordList } from '@app/composables/useWordList.ts';
export type { WordListShape } from '@app/composables/useWordList.ts';

export {
	parseBlend,
	fetchVariables,
	parseVariable,
	parseGlobalVariable,
	parseAttributeGroup,
	parseAttributeKey,
	parseAttributeTag,
	parseVariableTag,
	parseVariableNumber,
	parseVariableString,
	parseVariableTemplate,
	parseVariableAttr,
	parseVariableEnum,
	parseVariableFile,
	parseVariableTeam,
	parseMultiLineString,
	parseSpriteName,
	parseEventType,
	parseEnumGroup,
	parseEnumString,
	parseEnumStringTag,
	parseGroupEnumString,
	parseListItem,
	parseParameter,
	parseActor,
	parseSkill,
	parseState,
	parseEquipment,
	parseItem,
	parsePosition,
	parseAngle,
	parseTrigger,
	parseLight,
	parseRegion,
	parseTilemap,
	parseObject,
	parseElement,
	parsePresetObject,
	parsePresetElement,
	parseTeam,
	parseHexColor,
	parseActorSelector,
	parseFileName,
	parseAudioType,
	parseWait,
	parseEasing,
	parseUnlinkedId,
	parseTextTags,
	removeTextTags
} from '@app/composables/useCommandParse.ts';

type CommandMethod = (...args: any[]) => any;

interface CommandCustomShape {
	customFolder: {
		class: string;
		value: string;
		expanded?: boolean;
		children: unknown[] | null;
	} | null;
	commandNameMap: Record<string, string> | null;
	initialize: () => void;
	parse: (id: string, parameters: Record<string, unknown>) => Record<string, unknown>[];
	load: (id: string, parameters: Record<string, unknown>) => void;
	save: () => void;
	loadCommandList: () => void;
	windowLocalize: (event: Event) => void;
	windowX: number | null;
	windowY: number | null;
	parsingScript: { id: string; parameters: Record<string, unknown> | null };
	loadedScript: { id: string; parameters: Record<string, unknown> | null };
	windowFrame: HTMLElement & {
		style: CSSStyleDeclaration;
		absolute(x: number | null, y: number | null): void;
		setTitle(title: string): void;
	};
	parameterPane: HTMLElement & {
		getData?: () => Array<{ id: string; parameters: Record<string, unknown> | null }>;
		onResize?: () => void;
		createDetailBox?: () => unknown;
		clear?: () => void;
	};
	parameterGrid: HTMLElement;
	[k: string]: unknown;
}

export const Command: {
	target: typeof commandState.target;
	id: typeof commandState.id;
	words: typeof commandState.words;
	invalid: typeof commandState.invalid;
	saveVars: typeof commandState.saveVars;
	returnType: typeof commandState.returnType;
	eventName: typeof commandState.eventName;
	eventIndex: typeof commandState.eventIndex;
	variables: typeof commandState.variables;
	varMap: typeof commandState.varMap;
	dependsOn: typeof commandState.dependsOn;
	currentCommand: typeof commandState.currentCommand;
	setClass: (className: string) => string;
	initialize: CommandMethod;
	insert: CommandMethod;
	edit: CommandMethod;
	open: CommandMethod;
	save: CommandMethod;
	parse: CommandMethod;
	parseNone: CommandMethod;
	parseBlend: CommandMethod;
	fetchVariables: CommandMethod;
	parseVariable: CommandMethod;
	parseGlobalVariable: CommandMethod;
	parseAttributeGroup: CommandMethod;
	parseAttributeKey: CommandMethod;
	parseAttributeTag: CommandMethod;
	parseVariableTag: CommandMethod;
	parseVariableNumber: CommandMethod;
	parseVariableString: CommandMethod;
	parseVariableTemplate: CommandMethod;
	parseVariableAttr: CommandMethod;
	parseVariableEnum: CommandMethod;
	parseVariableFile: CommandMethod;
	parseVariableTeam: CommandMethod;
	parseMultiLineString: CommandMethod;
	parseSpriteName: CommandMethod;
	parseEventType: CommandMethod;
	parseEnumGroup: CommandMethod;
	parseEnumString: CommandMethod;
	parseEnumStringTag: CommandMethod;
	parseGroupEnumString: CommandMethod;
	parseListItem: CommandMethod;
	parseParameter: CommandMethod;
	parseActor: CommandMethod;
	parseSkill: CommandMethod;
	parseState: CommandMethod;
	parseEquipment: CommandMethod;
	parseItem: CommandMethod;
	parsePosition: CommandMethod;
	parseAngle: CommandMethod;
	parseTrigger: CommandMethod;
	parseLight: CommandMethod;
	parseRegion: CommandMethod;
	parseTilemap: CommandMethod;
	parseObject: CommandMethod;
	parseElement: CommandMethod;
	parsePresetObject: CommandMethod;
	parsePresetElement: CommandMethod;
	parseTeam: CommandMethod;
	parseHexColor: CommandMethod;
	parseActorSelector: CommandMethod;
	parseFileName: CommandMethod;
	parseAudioType: CommandMethod;
	parseWait: CommandMethod;
	parseEasing: CommandMethod;
	parseUnlinkedId: CommandMethod;
	parseTextTags: CommandMethod;
	removeTextTags: CommandMethod;
	setNormalColor: CommandMethod;
	setVariableColor: CommandMethod;
	setGlobalVariableColor: CommandMethod;
	setDelimiterColor: CommandMethod;
	setOperatorColor: CommandMethod;
	setBooleanColor: CommandMethod;
	setNumberColor: CommandMethod;
	setStringColor: CommandMethod;
	setScriptColor: CommandMethod;
	setFileColor: CommandMethod;
	setPresetColor: CommandMethod;
	setWeakColor: CommandMethod;
	setCommaColors: CommandMethod;
	setTextId: CommandMethod;
	setTooltip: CommandMethod;
	setInvalid: CommandMethod;
	forEachCommand: CommandMethod;
	WordList: { new (): WordListShape };
	cases: Record<string, CommandSchema>;
	custom: CommandCustomShape;
} = {
	target: commandState.target,
	id: commandState.id,
	words: commandState.words,
	invalid: commandState.invalid,
	saveVars: commandState.saveVars,
	returnType: commandState.returnType,
	eventName: commandState.eventName,
	eventIndex: commandState.eventIndex,
	variables: commandState.variables,
	varMap: commandState.varMap,
	dependsOn: commandState.dependsOn,
	currentCommand: commandState.currentCommand,
	setClass: null as unknown as (className: string) => string,
	initialize: null as unknown as CommandMethod,
	insert: null as unknown as CommandMethod,
	edit: null as unknown as CommandMethod,
	open: null as unknown as CommandMethod,
	save: null as unknown as CommandMethod,
	parse: null as unknown as CommandMethod,
	parseNone: null as unknown as CommandMethod,
	parseBlend: null as unknown as CommandMethod,
	fetchVariables: null as unknown as CommandMethod,
	parseVariable: null as unknown as CommandMethod,
	parseGlobalVariable: null as unknown as CommandMethod,
	parseAttributeGroup: null as unknown as CommandMethod,
	parseAttributeKey: null as unknown as CommandMethod,
	parseAttributeTag: null as unknown as CommandMethod,
	parseVariableTag: null as unknown as CommandMethod,
	parseVariableNumber: null as unknown as CommandMethod,
	parseVariableString: null as unknown as CommandMethod,
	parseVariableTemplate: null as unknown as CommandMethod,
	parseVariableAttr: null as unknown as CommandMethod,
	parseVariableEnum: null as unknown as CommandMethod,
	parseVariableFile: null as unknown as CommandMethod,
	parseVariableTeam: null as unknown as CommandMethod,
	parseMultiLineString: null as unknown as CommandMethod,
	parseSpriteName: null as unknown as CommandMethod,
	parseEventType: null as unknown as CommandMethod,
	parseEnumGroup: null as unknown as CommandMethod,
	parseEnumString: null as unknown as CommandMethod,
	parseEnumStringTag: null as unknown as CommandMethod,
	parseGroupEnumString: null as unknown as CommandMethod,
	parseListItem: null as unknown as CommandMethod,
	parseParameter: null as unknown as CommandMethod,
	parseActor: null as unknown as CommandMethod,
	parseSkill: null as unknown as CommandMethod,
	parseState: null as unknown as CommandMethod,
	parseEquipment: null as unknown as CommandMethod,
	parseItem: null as unknown as CommandMethod,
	parsePosition: null as unknown as CommandMethod,
	parseAngle: null as unknown as CommandMethod,
	parseTrigger: null as unknown as CommandMethod,
	parseLight: null as unknown as CommandMethod,
	parseRegion: null as unknown as CommandMethod,
	parseTilemap: null as unknown as CommandMethod,
	parseObject: null as unknown as CommandMethod,
	parseElement: null as unknown as CommandMethod,
	parsePresetObject: null as unknown as CommandMethod,
	parsePresetElement: null as unknown as CommandMethod,
	parseTeam: null as unknown as CommandMethod,
	parseHexColor: null as unknown as CommandMethod,
	parseActorSelector: null as unknown as CommandMethod,
	parseFileName: null as unknown as CommandMethod,
	parseAudioType: null as unknown as CommandMethod,
	parseWait: null as unknown as CommandMethod,
	parseEasing: null as unknown as CommandMethod,
	parseUnlinkedId: null as unknown as CommandMethod,
	parseTextTags: null as unknown as CommandMethod,
	removeTextTags: null as unknown as CommandMethod,
	setNormalColor: null as unknown as CommandMethod,
	setVariableColor: null as unknown as CommandMethod,
	setGlobalVariableColor: null as unknown as CommandMethod,
	setDelimiterColor: null as unknown as CommandMethod,
	setOperatorColor: null as unknown as CommandMethod,
	setBooleanColor: null as unknown as CommandMethod,
	setNumberColor: null as unknown as CommandMethod,
	setStringColor: null as unknown as CommandMethod,
	setScriptColor: null as unknown as CommandMethod,
	setFileColor: null as unknown as CommandMethod,
	setPresetColor: null as unknown as CommandMethod,
	setWeakColor: null as unknown as CommandMethod,
	setCommaColors: null as unknown as CommandMethod,
	setTextId: null as unknown as CommandMethod,
	setTooltip: null as unknown as CommandMethod,
	setInvalid: null as unknown as CommandMethod,
	forEachCommand: null as unknown as CommandMethod,
	WordList: null as unknown as { new (): WordListShape },
	cases: {} as Record<string, CommandSchema>,
	custom: null as unknown as CommandCustomShape
};

// 注：此前为避免循环依赖被注释，但这是运行时绑定的关键链路 —— CommandSchema.parse / .initAll 等通过此绑定挂载到 Command.parse / Command.words 等，注释掉会导致运行时 Command.parse is not a function / Command.words 为 null。循环依赖问题应通过 module-init.js 的加载顺序（head.html SOT）保证 schema.ts 先于此文件加载。
Command.initialize = CommandSchema.initAll;
Command.insert = CommandSchema.insert;
Command.open = CommandSchema.open;
Command.edit = CommandSchema.edit;
Command.save = CommandSchema.save;
Command.parse = CommandSchema.parse;

// Command.cases.showText extracted -> module/command/showText.js
