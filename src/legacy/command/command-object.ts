import { CommandSchema } from '@/module/command/schema.ts';

// Command 是中央属性袋：大量字段以 null 起步，由 command-parse / command-color / command-custom / command-tip 等模块在加载后动态挂载。为避免在后续文件中赋值时类型报错，所有方法字段统一声明为可空函数类型。

type CommandMethod = (...args: any[]) => any;

export const Command: {
	target: any;
	id: any;
	words: any;
	invalid: boolean;
	saveVars: boolean;
	returnType: string;
	eventName: string;
	eventIndex: number;
	variables: any[];
	varMap: Record<string, CommandSchema>;
	dependsOn: string[];
	currentCommand: any;
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
	WordList: any;
	cases: Record<string, CommandSchema>;
	custom: any;
} = {
	target: null as any,
	id: null as any,
	words: null as any,
	invalid: false,
	saveVars: false,
	returnType: '',
	eventName: '',
	eventIndex: 0,
	variables: [],
	varMap: {},
	dependsOn: ['Inspector'],
	// runtime 挂载: command-parse.ts 中赋值当前正在解析的指令上下文
	currentCommand: null as any,
	// runtime 挂载: command-color.ts 中挂载类名染色函数
	setClass: null as any,
	initialize: null as any,
	insert: null as any,
	edit: null as any,
	open: null as any,
	save: null as any,
	parse: null as any,
	parseNone: null as any,
	parseBlend: null as any,
	fetchVariables: null as any,
	parseVariable: null as any,
	parseGlobalVariable: null as any,
	parseAttributeGroup: null as any,
	parseAttributeKey: null as any,
	parseAttributeTag: null as any,
	parseVariableTag: null as any,
	parseVariableNumber: null as any,
	parseVariableString: null as any,
	parseVariableTemplate: null as any,
	parseVariableAttr: null as any,
	parseVariableEnum: null as any,
	parseVariableFile: null as any,
	parseVariableTeam: null as any,
	parseMultiLineString: null as any,
	parseSpriteName: null as any,
	parseEventType: null as any,
	parseEnumGroup: null as any,
	parseEnumString: null as any,
	parseEnumStringTag: null as any,
	parseGroupEnumString: null as any,
	parseListItem: null as any,
	parseParameter: null as any,
	parseActor: null as any,
	parseSkill: null as any,
	parseState: null as any,
	parseEquipment: null as any,
	parseItem: null as any,
	parsePosition: null as any,
	parseAngle: null as any,
	parseTrigger: null as any,
	parseLight: null as any,
	parseRegion: null as any,
	parseTilemap: null as any,
	parseObject: null as any,
	parseElement: null as any,
	parsePresetObject: null as any,
	parsePresetElement: null as any,
	parseTeam: null as any,
	parseHexColor: null as any,
	parseActorSelector: null as any,
	parseFileName: null as any,
	parseAudioType: null as any,
	parseWait: null as any,
	parseEasing: null as any,
	parseUnlinkedId: null as any,
	parseTextTags: null as any,
	removeTextTags: null as any,
	setNormalColor: null as any,
	setVariableColor: null as any,
	setGlobalVariableColor: null as any,
	setDelimiterColor: null as any,
	setOperatorColor: null as any,
	setBooleanColor: null as any,
	setNumberColor: null as any,
	setStringColor: null as any,
	setScriptColor: null as any,
	setFileColor: null as any,
	setPresetColor: null as any,
	setWeakColor: null as any,
	setCommaColors: null as any,
	setTextId: null as any,
	setTooltip: null as any,
	setInvalid: null as any,
	forEachCommand: null as any,
	WordList: null as any,
	cases: {} as Record<string, CommandSchema>,
	custom: null
};

// 注：此前为避免循环依赖被注释，但这是运行时绑定的关键链路 —— CommandSchema.parse / .initAll 等通过此绑定挂载到 Command.parse / Command.words 等，注释掉会导致运行时 Command.parse is not a function / Command.words 为 null。循环依赖问题应通过 module-init.js 的加载顺序（head.html SOT）保证 schema.ts 先于此文件加载。
Command.initialize = CommandSchema.initAll;
Command.insert = CommandSchema.insert;
Command.open = CommandSchema.open;
Command.edit = CommandSchema.edit;
Command.save = CommandSchema.save;
Command.parse = CommandSchema.parse;

// Command.cases.showText extracted -> module/command/showText.js
