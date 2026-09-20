import { commandCases } from '@app/commands/command-registry.ts';
import type { WordListShape } from '@app/composables/useWordList.ts';
import { commandState } from '@app/composables/useCommandState.ts';
import type { CommandSchema } from './schema.ts';

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

import * as CommandColor from '@app/composables/useCommandColor.ts';
import { WordList } from '@app/composables/useWordList.ts';
import * as CommandParse from '@app/composables/useCommandParse.ts';
import type { YamiElement } from '@app/types/element-api';

// oxlint-disable-next-line no-explicit-any
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
	/**
	 * 下面三个元素槽由 `Command.custom.initialize()` 从元素注册表取（见 `command-custom.ts`），
	 * 在那之前**确实不存在** —— `initialize()` 里本来就有一处 `if (!this.parameterPane) return;`。
	 * 所以声明成可选，字面量不必再写 `null as unknown as …` 占位。
	 */
	windowFrame?: HTMLElement & {
		style: CSSStyleDeclaration;
		absolute(x: number | null, y: number | null): void;
		setTitle(title: string): void;
	};
	parameterPane?: YamiElement & {
		getData?: () => Array<{ id: string; parameters: Record<string, unknown> | null }>;
		onResize?: () => void;
		createDetailBox?: () => unknown;
		clear?: () => void;
	};
	parameterGrid?: HTMLElement;
	[k: string]: unknown;
}

interface CommandBranch {
	commands: CommandCase[];
}

interface CommandCase {
	id: string;
	params: {
		choices: CommandBranch[];
		branches: CommandBranch[];
		elseCommands?: CommandCase[];
		defaultCommands?: CommandCase[];
		commands: CommandCase[];
	};
}

function forEachCommand(commands: CommandCase[], handler: (command: CommandCase) => void): void {
	const forEach = (commands: CommandCase[]): void => {
		for (const command of commands) {
			handler(command);
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						forEach(choice.commands);
					}
					continue;
				case 'if':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.elseCommands) {
						forEach(command.params.elseCommands);
					}
					continue;
				case 'switch':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.defaultCommands) {
						forEach(command.params.defaultCommands);
					}
					continue;
				case 'loop':
					forEach(command.params.commands);
					continue;
				case 'forEach':
					forEach(command.params.commands);
					continue;
				case 'independent':
					forEach(command.params.commands);
					continue;
				case 'transition':
					forEach(command.params.commands);
					continue;
			}
		}
	};
	forEach(commands);
}

interface CommandShape {
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
	forEachCommand: CommandMethod;
	WordList: { new (): WordListShape };
	cases: Record<string, CommandSchema>;
	custom: CommandCustomShape;
}

export const Command = {
	get target() {
		return commandState.target;
	},
	set target(value) {
		commandState.target = value;
	},
	get id() {
		return commandState.id;
	},
	set id(value) {
		commandState.id = value;
	},
	get words() {
		return commandState.words;
	},
	set words(value) {
		commandState.words = value;
	},
	get invalid() {
		return commandState.invalid;
	},
	set invalid(value) {
		commandState.invalid = value;
	},
	get saveVars() {
		return commandState.saveVars;
	},
	set saveVars(value) {
		commandState.saveVars = value;
	},
	get returnType() {
		return commandState.returnType;
	},
	set returnType(value) {
		commandState.returnType = value;
	},
	get eventName() {
		return commandState.eventName;
	},
	set eventName(value) {
		commandState.eventName = value;
	},
	get eventIndex() {
		return commandState.eventIndex;
	},
	set eventIndex(value) {
		commandState.eventIndex = value;
	},
	get variables() {
		return commandState.variables;
	},
	set variables(value) {
		commandState.variables = value;
	},
	get varMap() {
		return commandState.varMap;
	},
	set varMap(value) {
		commandState.varMap = value;
	},
	get dependsOn() {
		return commandState.dependsOn;
	},
	set dependsOn(value) {
		commandState.dependsOn = value;
	},
	get currentCommand() {
		return commandState.currentCommand;
	},
	set currentCommand(value) {
		commandState.currentCommand = value;
	},
	cases: commandCases
} satisfies Partial<CommandShape> as CommandShape;

export function initCommandColorBridges(): void {
	Command.setNormalColor = CommandColor.setNormalColor;
	Command.setVariableColor = CommandColor.setVariableColor;
	Command.setGlobalVariableColor = CommandColor.setGlobalVariableColor;
	Command.setDelimiterColor = CommandColor.setDelimiterColor;
	Command.setOperatorColor = CommandColor.setOperatorColor;
	Command.setBooleanColor = CommandColor.setBooleanColor;
	Command.setNumberColor = CommandColor.setNumberColor;
	Command.setStringColor = CommandColor.setStringColor;
	Command.setScriptColor = CommandColor.setScriptColor;
	Command.setFileColor = CommandColor.setFileColor;
	Command.setPresetColor = CommandColor.setPresetColor;
	Command.setWeakColor = CommandColor.setWeakColor;
	Command.setCommaColors = CommandColor.setCommaColors;
	Command.setTextId = CommandColor.setTextId;
	Command.setTooltip = CommandColor.setTooltip;
	Command.setClass = CommandColor.setClass;
}

export function initCommandParseBridges(): void {
	Command.parseBlend = CommandParse.parseBlend;
	Command.fetchVariables = CommandParse.fetchVariables;
	Command.parseVariable = CommandParse.parseVariable;
	Command.parseGlobalVariable = CommandParse.parseGlobalVariable;
	Command.parseAttributeGroup = CommandParse.parseAttributeGroup;
	Command.parseAttributeKey = CommandParse.parseAttributeKey;
	Command.parseAttributeTag = CommandParse.parseAttributeTag;
	Command.parseVariableTag = CommandParse.parseVariableTag;
	Command.parseVariableNumber = CommandParse.parseVariableNumber;
	Command.parseVariableString = CommandParse.parseVariableString;
	Command.parseVariableTemplate = CommandParse.parseVariableTemplate;
	Command.parseVariableAttr = CommandParse.parseVariableAttr;
	Command.parseVariableEnum = CommandParse.parseVariableEnum;
	Command.parseVariableFile = CommandParse.parseVariableFile;
	Command.parseVariableTeam = CommandParse.parseVariableTeam;
	Command.parseMultiLineString = CommandParse.parseMultiLineString;
	Command.parseSpriteName = CommandParse.parseSpriteName;
	Command.parseEventType = CommandParse.parseEventType;
	Command.parseEnumGroup = CommandParse.parseEnumGroup;
	Command.parseEnumString = CommandParse.parseEnumString;
	Command.parseEnumStringTag = CommandParse.parseEnumStringTag;
	Command.parseGroupEnumString = CommandParse.parseGroupEnumString;
	Command.parseListItem = CommandParse.parseListItem;
	Command.parseParameter = CommandParse.parseParameter;
	Command.parseActor = CommandParse.parseActor;
	Command.parseSkill = CommandParse.parseSkill;
	Command.parseState = CommandParse.parseState;
	Command.parseEquipment = CommandParse.parseEquipment;
	Command.parseItem = CommandParse.parseItem;
	Command.parsePosition = CommandParse.parsePosition;
	Command.parseAngle = CommandParse.parseAngle;
	Command.parseTrigger = CommandParse.parseTrigger;
	Command.parseLight = CommandParse.parseLight;
	Command.parseRegion = CommandParse.parseRegion;
	Command.parseTilemap = CommandParse.parseTilemap;
	Command.parseObject = CommandParse.parseObject;
	Command.parseElement = CommandParse.parseElement;
	Command.parsePresetObject = CommandParse.parsePresetObject;
	Command.parsePresetElement = CommandParse.parsePresetElement;
	Command.parseTeam = CommandParse.parseTeam;
	Command.parseHexColor = CommandParse.parseHexColor;
	Command.parseActorSelector = CommandParse.parseActorSelector;
	Command.parseFileName = CommandParse.parseFileName;
	Command.parseAudioType = CommandParse.parseAudioType;
	Command.parseWait = CommandParse.parseWait;
	Command.parseEasing = CommandParse.parseEasing;
	Command.parseUnlinkedId = CommandParse.parseUnlinkedId;
	Command.parseTextTags = CommandParse.parseTextTags;
	Command.removeTextTags = CommandParse.removeTextTags;
}

Command.forEachCommand = forEachCommand;
Command.WordList = WordList as typeof Command.WordList;

export function bindCommandSchema(Schema: typeof CommandSchema): void {
	// oxlint-disable-next-line unbound-method
	Command.initialize = Schema.initAll;
	// oxlint-disable-next-line unbound-method
	Command.insert = Schema.insert;
	// oxlint-disable-next-line unbound-method
	Command.open = Schema.open;
	// oxlint-disable-next-line unbound-method
	Command.edit = Schema.edit;
	// oxlint-disable-next-line unbound-method
	Command.save = Schema.save;
	// oxlint-disable-next-line unbound-method
	Command.parse = Schema.parse;
}
