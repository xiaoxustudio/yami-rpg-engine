import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

interface SetStringOperand {
	type: string;
	value: string;
	variable: { type: string; key: string };
	method: string;
	index: number;
	begin: number;
	end: number;
	length: number;
	pad: string;
	pattern: string;
	replacement: string;
	attributeId: string;
	stringId: string;
	property: string;
	actor: { type: string };
	skill: { type: string };
	trigger: { type: string };
	state: { type: string };
	equipment: { type: string };
	item: { type: string };
	fileId: string;
	element: { type: string };
	key: string;
	script: string;
	data: string;
	choiceIndex: number;
	format: string;
	width: number;
	height: number;
}

export interface SetStringForm {
	variable: { type: string; key: string };
	operation: string;
	operandType: string;
	commonValue: string;
	stringMethod: string;
	commonVariable: { type: string; key: string };
	stringCharIndex: number;
	stringSliceBegin: number;
	stringSliceEnd: number;
	stringPadStartLength: number;
	stringPadStartPad: string;
	stringReplacePattern: string;
	stringReplaceReplacement: string;
	attributeId: string;
	enumStringId: string;
	objectProperty: string;
	elementProperty: string;
	elementElement: { type: string };
	commonActor: { type: string };
	commonSkill: { type: string };
	commonTrigger: { type: string };
	commonState: { type: string };
	commonEquipment: { type: string };
	commonItem: { type: string };
	objectFileId: string;
	listIndex: number;
	parameterKey: string;
	script: string;
	otherData: string;
	showChoicesIndex: number;
	parseTimestampVariable: { type: string; key: string };
	parseTimestampFormat: string;
	screenshotWidth: number;
	screenshotHeight: number;
}

Command.cases.setString = new CommandSchema({
	name: 'setString',
	onInitialize() {
		$('#setString-operation')?.loadItems?.([
			{ name: 'Set', value: 'set' },
			{ name: 'Add', value: 'add' }
		]);
		$('#setString-operand-type')?.loadItems?.([
			{ name: 'Constant', value: 'constant' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'Template String', value: 'template' },
			{ name: 'String Method', value: 'string' },
			{ name: 'Attribute Key', value: 'attribute' },
			{ name: 'Enumeration', value: 'enum' },
			{ name: 'Object', value: 'object' },
			{ name: 'Element', value: 'element' },
			{ name: 'List', value: 'list' },
			{ name: 'Parameter', value: 'parameter' },
			{ name: 'Script', value: 'script' },
			{ name: 'Other', value: 'other' }
		]);
		$('#setString-operand-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'constant',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'variable',
					targets: [$('#setString-operand-common-variable')]
				},
				{
					case: 'template',
					targets: [$('#setString-operand-common-value')]
				},
				{
					case: 'string',
					targets: [
						$('#setString-operand-string-method'),
						$('#setString-operand-common-variable')
					]
				},
				{
					case: 'attribute',
					targets: [$('#setString-operand-attribute-attributeId')]
				},
				{
					case: 'enum',
					targets: [$('#setString-operand-enum-stringId')]
				},
				{
					case: 'object',
					targets: [$('#setString-operand-object-property')]
				},
				{
					case: 'element',
					targets: [
						$('#setString-operand-element-property'),
						$('#setString-operand-element-element')
					]
				},
				{
					case: 'list',
					targets: [
						$('#setString-operand-common-variable'),
						$('#setString-operand-list-index')
					]
				},
				{
					case: 'parameter',
					targets: [$('#setString-operand-parameter-key')]
				},
				{ case: 'script', targets: [$('#setString-operand-script')] },
				{ case: 'other', targets: [$('#setString-operand-other-data')] }
			]);
		// setString-operand-type write 经 Vue 模板转发（setString.vue @write → Command.cases.setString.writeHandler）
		$('#setString-operand-string-method')?.loadItems?.([
			{ name: 'Char', value: 'char' },
			{ name: 'Slice', value: 'slice' },
			{ name: 'Pad Start', value: 'pad-start' },
			{ name: 'Replace', value: 'replace' },
			{ name: 'Replace All', value: 'replace-all' }
		]);
		$('#setString-operand-string-method')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'char',
					targets: [$('#setString-operand-string-char-index')]
				},
				{
					case: 'slice',
					targets: [
						$('#setString-operand-string-slice-begin'),
						$('#setString-operand-string-slice-end')
					]
				},
				{
					case: 'pad-start',
					targets: [
						$('#setString-operand-string-pad-start-length'),
						$('#setString-operand-string-pad-start-pad')
					]
				},
				{
					case: ['replace', 'replace-all'],
					targets: [
						$('#setString-operand-string-replace-pattern'),
						$('#setString-operand-string-replace-replacement')
					]
				}
			]);
		$('#setString-operand-object-property')?.loadItems?.([
			{ name: 'Actor - Team ID', value: 'actor-team-id' },
			{ name: 'Actor - File ID', value: 'actor-file-id' },
			{
				name: 'Actor - Anim Motion Name',
				value: 'actor-animation-motion-name'
			},
			{ name: 'Skill - File ID', value: 'skill-file-id' },
			{ name: 'Trigger - File ID', value: 'trigger-file-id' },
			{ name: 'State - File ID', value: 'state-file-id' },
			{ name: 'Equipment - File ID', value: 'equipment-file-id' },
			{ name: 'Equipment - Slot', value: 'equipment-slot' },
			{ name: 'Item - File ID', value: 'item-file-id' },
			{ name: 'File - ID', value: 'file-id' }
		]);
		$('#setString-operand-object-property')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: ['actor-team-id', 'actor-file-id', 'actor-animation-motion-name'],
					targets: [$('#setString-operand-common-actor')]
				},
				{
					case: 'skill-file-id',
					targets: [$('#setString-operand-common-skill')]
				},
				{
					case: 'trigger-file-id',
					targets: [$('#setString-operand-common-trigger')]
				},
				{
					case: 'state-file-id',
					targets: [$('#setString-operand-common-state')]
				},
				{
					case: ['equipment-file-id', 'equipment-slot'],
					targets: [$('#setString-operand-common-equipment')]
				},
				{
					case: 'item-file-id',
					targets: [$('#setString-operand-common-item')]
				},
				{
					case: 'file-id',
					targets: [$('#setString-operand-object-fileId')]
				}
			]);
		$('#setString-operand-element-property')?.loadItems?.([
			{ name: 'Text - Content', value: 'text-content' },
			{ name: 'Text Box - Text', value: 'textBox-text' },
			{ name: 'Dialog Box - Content', value: 'dialogBox-content' }
		]);
		$('#setString-operand-other-data')?.loadItems?.([
			{ name: 'Event Trigger Key', value: 'trigger-key' },
			{
				name: 'Start Position - Scene ID',
				value: 'start-position-scene-id'
			},
			{ name: 'Show Text - Content', value: 'showText-content' },
			{ name: 'Show Choices - Content', value: 'showChoices-content' },
			{ name: 'Parse Timestamp', value: 'parse-timestamp' },
			{ name: 'Screenshot(Base64)', value: 'screenshot' },
			{ name: 'Game Language', value: 'game-language' }
		]);
		$('#setString-operand-other-data')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'showChoices-content',
					targets: [$('#setString-operand-showChoices-content-choiceIndex')]
				},
				{
					case: 'parse-timestamp',
					targets: [
						$('#setString-operand-parse-timestamp-variable'),
						$('#setString-operand-parse-timestamp-format')
					]
				},
				{
					case: 'screenshot',
					targets: [
						$('#setString-operand-screenshot-width'),
						$('#setString-operand-screenshot-height')
					]
				}
			]);
	},
	writeHandler(event: Event) {
		let filter = 'all';
		switch (event.value) {
			case 'variable':
				filter = 'all';
				break;
			case 'string':
				filter = 'string';
				break;
			case 'object':
			case 'list':
				filter = 'object';
				break;
		}
		const element = $('#setString-operand-common-variable');
		if (element) {
			element.filter = filter;
		}
	},
	parseOperation(operation: string) {
		switch (operation) {
			case 'set':
				return ' = ';
			case 'add':
				return ' += ';
		}
	},
	parseStringMethod(operand: SetStringOperand) {
		const method = operand.method;
		const variable = operand.variable;
		const methodName = Local.get!('command.setString.string.' + method);
		const varName = Command.parseVariable!(variable, 'string');
		switch (method) {
			case 'char': {
				const index = Command.parseVariableNumber!(operand.index);
				return methodName + Token('(') + varName + Token(', ') + index + Token(')');
			}
			case 'slice': {
				const begin = Command.parseVariableNumber!(operand.begin);
				const end = Command.parseVariableNumber!(operand.end);
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					begin +
					Token(', ') +
					end +
					Token(')')
				);
			}
			case 'pad-start': {
				const length = Command.setNumberColor!(operand.length);
				const pad = Command.setStringColor!(operand.pad);
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					length +
					Token(', ') +
					pad +
					Token(')')
				);
			}
			case 'replace':
			case 'replace-all': {
				const pattern = Command.parseVariableString!(operand.pattern);
				const replacement = Command.parseVariableString!(operand.replacement);
				return (
					methodName +
					Token('(') +
					varName +
					Token(', ') +
					pattern +
					Token(', ') +
					replacement +
					Token(')')
				);
			}
		}
	},
	parseObjectProperty(operand: SetStringOperand) {
		const property = Local.get!('command.setString.object.' + operand.property);
		switch (operand.property) {
			case 'actor-team-id':
			case 'actor-file-id':
			case 'actor-animation-motion-name':
				return (
					Command.parseActor!(operand.actor) +
					Token(' -> ') +
					property.replace('.', Token('.'))
				);
			case 'skill-file-id':
				return Command.parseSkill!(operand.skill) + Token(' -> ') + property;
			case 'trigger-file-id':
				return Command.parseTrigger!(operand.trigger) + Token(' -> ') + property;
			case 'state-file-id':
				return Command.parseState!(operand.state) + Token(' -> ') + property;
			case 'equipment-file-id':
			case 'equipment-slot':
				return Command.parseEquipment!(operand.equipment) + Token(' -> ') + property;
			case 'item-file-id':
				return Command.parseItem!(operand.item) + Token(' -> ') + property;
			case 'file-id':
				return Command.parseFileName!(operand.fileId) + Token(' -> ') + property;
		}
	},
	parseElementProperty(operand: SetStringOperand) {
		const element = Command.parseElement!(operand.element);
		const property = Local.get!('command.setString.element.' + operand.property);
		return element + Token(' -> ') + property.replace('.', Token('.'));
	},
	parseOther(operand: SetStringOperand) {
		const label = Local.get!('command.setString.other.' + operand.data).replace(
			'.',
			Token('.')
		);
		switch (operand.data) {
			case 'trigger-key':
			case 'start-position-scene-id':
			case 'showText-content':
			case 'game-language':
				return label;
			case 'showChoices-content-0':
			case 'showChoices-content-1':
			case 'showChoices-content-2':
			case 'showChoices-content-3': {
				const label = Local.get!('command.setString.other.showChoices-content');
				return (
					label +
					Token('[') +
					Command.setNumberColor!(operand.data.slice(-1)) +
					Token(']')
				);
			}
			case 'showChoices-content':
				return (
					label +
					Token('[') +
					Command.parseVariableNumber!(operand.choiceIndex) +
					Token(']')
				);
			case 'parse-timestamp': {
				const variable = Command.parseVariable!(operand.variable, 'number');
				const format = Command.parseVariableString!(operand.format);
				return label + Token('(') + variable + Token(', ') + format + Token(')');
			}
			case 'screenshot': {
				const width = Command.setNumberColor!(operand.width);
				const height = Command.setNumberColor!(operand.height);
				return label + Token('(') + width + Token(', ') + height + Token(')');
			}
		}
	},
	parseOperand(operand: SetStringOperand) {
		switch (operand.type) {
			case 'constant':
				return Command.setStringColor!(`"${Command.parseMultiLineString!(operand.value)}"`);
			case 'template':
				return Command.parseVariableTemplate!(operand.value);
			case 'variable':
				return Command.parseVariable!(operand.variable, 'string');
			case 'string':
				return this.parseStringMethod!(operand);
			case 'attribute':
				return Command.parseAttributeTag!(operand.attributeId, 'string');
			case 'enum':
				return Command.parseEnumStringTag!(operand.stringId);
			case 'object':
				return this.parseObjectProperty!(operand);
			case 'element':
				return this.parseElementProperty!(operand);
			case 'list':
				return Command.parseListItem!(operand.variable, operand.index);
			case 'parameter':
				return Command.parseParameter!(operand.key);
			case 'script':
				return operand.script;
			case 'other':
				return this.parseOther!(operand);
		}
	},
	customParse({
		variable,
		operation,
		operand
	}: {
		variable: unknown;
		operation: string;
		operand: SetStringOperand;
	}) {
		const varDesc = Command.parseVariable!(variable, 'string', operation === 'set');
		const operator = Command.setOperatorColor!(this.parseOperation!(operation));
		const expression = this.parseOperand!(operand);
		return [
			{ color: 'variable' },
			{ text: Local.get!('command.setString.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operand = { type: 'constant', value: '' } as SetStringOperand
	}: {
		variable?: unknown;
		operation?: string;
		operand?: SetStringOperand;
	}) {
		let commonValue = '';
		let stringMethod = 'char';
		let commonVariable = { type: 'local', key: '' };
		let stringCharIndex = 0;
		let stringSliceBegin = 0;
		let stringSliceEnd = 0;
		let stringPadStartLength = 2;
		let stringPadStartPad = '0';
		let stringReplacePattern = '';
		let stringReplaceReplacement = '';
		let attributeId = '';
		let enumStringId = '';
		let objectProperty = 'actor-team-id';
		let elementProperty = 'text-content';
		let elementElement = { type: 'trigger' };
		let commonActor = { type: 'trigger' };
		let commonSkill = { type: 'trigger' };
		let commonTrigger = { type: 'trigger' };
		let commonState = { type: 'trigger' };
		let commonEquipment = { type: 'trigger' };
		let commonItem = { type: 'trigger' };
		let objectFileId = '';
		let listIndex = 0;
		let parameterKey = '';
		let script = '';
		let otherData = 'trigger-key';
		let showChoicesIndex = 0;
		let parseTimestampVariable = { type: 'local', key: '' };
		let parseTimestampFormat = '{Y}-{M}-{D} {h}:{m}:{s}';
		let screenshotWidth = 320;
		let screenshotHeight = 180;
		switch (operand.type) {
			case 'constant':
			case 'template':
				commonValue = operand.value;
				break;
			case 'variable':
				commonVariable = operand.variable;
				break;
			case 'string':
				stringMethod = operand.method;
				commonVariable = operand.variable;
				stringCharIndex = operand.index ?? stringCharIndex;
				stringSliceBegin = operand.begin ?? stringSliceBegin;
				stringSliceEnd = operand.end ?? stringSliceEnd;
				stringPadStartLength = operand.length ?? stringPadStartLength;
				stringPadStartPad = operand.pad ?? stringPadStartPad;
				stringReplacePattern = operand.pattern ?? stringReplacePattern;
				stringReplaceReplacement = operand.replacement ?? stringReplaceReplacement;
				break;
			case 'attribute':
				attributeId = operand.attributeId;
				break;
			case 'enum':
				enumStringId = operand.stringId;
				break;
			case 'object':
				objectProperty = operand.property;
				commonActor = operand.actor ?? commonActor;
				commonSkill = operand.skill ?? commonSkill;
				commonTrigger = operand.trigger ?? commonTrigger;
				commonState = operand.state ?? commonState;
				commonEquipment = operand.equipment ?? commonEquipment;
				commonItem = operand.item ?? commonItem;
				objectFileId = operand.fileId ?? objectFileId;
				break;
			case 'element':
				elementProperty = operand.property;
				elementElement = operand.element;
				break;
			case 'list':
				commonVariable = operand.variable;
				listIndex = operand.index;
				break;
			case 'parameter':
				parameterKey = operand.key;
				break;
			case 'script':
				script = operand.script;
				break;
			case 'other':
				switch (operand.data) {
					case 'showChoices-content-0':
					case 'showChoices-content-1':
					case 'showChoices-content-2':
					case 'showChoices-content-3':
						operand.choiceIndex = parseInt(operand.data.slice(-1));
						operand.data = 'showChoices-content';
						break;
				}
				otherData = operand.data;
				showChoicesIndex = operand.choiceIndex ?? showChoicesIndex;
				parseTimestampVariable = operand.variable ?? parseTimestampVariable;
				parseTimestampFormat = operand.format ?? parseTimestampFormat;
				screenshotWidth = operand.width ?? screenshotWidth;
				screenshotHeight = operand.height ?? screenshotHeight;
				break;
		}
		const setForm = (
			$('#setString') as
				| (HTMLElement & { setForm?: (data: Partial<SetStringForm>) => void })
				| null
		)?.setForm;
		setForm?.({
			variable: variable as { type: string; key: string },
			operation,
			operandType: operand.type,
			commonValue,
			stringMethod,
			commonVariable,
			stringCharIndex,
			stringSliceBegin,
			stringSliceEnd,
			stringPadStartLength,
			stringPadStartPad,
			stringReplacePattern,
			stringReplaceReplacement,
			attributeId,
			enumStringId,
			objectProperty,
			elementProperty,
			elementElement,
			commonActor,
			commonSkill,
			commonTrigger,
			commonState,
			commonEquipment,
			commonItem,
			objectFileId,
			listIndex,
			parameterKey,
			script,
			otherData,
			showChoicesIndex,
			parseTimestampVariable,
			parseTimestampFormat,
			screenshotWidth,
			screenshotHeight
		});
		getFocus($('#setString-variable'));
	},
	customSave() {
		const getForm = (
			$('#setString') as (HTMLElement & { getForm?: () => SetStringForm }) | null
		)?.getForm;
		const form = getForm?.() ?? ({} as SetStringForm);
		const variable = form.variable;
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#setString-variable'));
		}
		const operation = form.operation;
		const type = form.operandType;
		let operand;
		switch (type) {
			case 'constant':
			case 'template': {
				const value = form.commonValue;
				operand = { type, value };
				break;
			}
			case 'variable': {
				const variable = form.commonVariable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#setString-operand-common-variable'));
				}
				operand = { type, variable };
				break;
			}
			case 'string': {
				const method = form.stringMethod;
				const variable = form.commonVariable;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#setString-operand-common-variable'));
				}
				switch (method) {
					case 'char': {
						const index = form.stringCharIndex;
						operand = { type, method, variable, index };
						break;
					}
					case 'slice': {
						const begin = form.stringSliceBegin;
						const end = form.stringSliceEnd;
						operand = { type, method, variable, begin, end };
						break;
					}
					case 'pad-start': {
						const length = form.stringPadStartLength;
						const pad = form.stringPadStartPad;
						operand = { type, method, variable, length, pad };
						break;
					}
					case 'replace':
					case 'replace-all': {
						const pattern = form.stringReplacePattern;
						if (pattern === '') {
							return getFocus($('#setString-operand-string-replace-pattern'));
						}
						const replacement = form.stringReplaceReplacement;
						operand = {
							type,
							method,
							variable,
							pattern,
							replacement
						};
						break;
					}
				}
				break;
			}
			case 'attribute': {
				const attributeId = form.attributeId;
				if (attributeId === '') {
					return getFocus($('#setString-operand-attribute-attributeId'));
				}
				operand = { type, attributeId };
				break;
			}
			case 'enum': {
				const stringId = form.enumStringId;
				if (stringId === '') {
					return getFocus($('#setString-operand-enum-stringId'));
				}
				operand = { type, stringId };
				break;
			}
			case 'object': {
				const property = form.objectProperty;
				switch (property) {
					case 'actor-team-id':
					case 'actor-file-id':
					case 'actor-animation-motion-name': {
						const actor = form.commonActor;
						operand = { type, property, actor };
						break;
					}
					case 'skill-file-id': {
						const skill = form.commonSkill;
						operand = { type, property, skill };
						break;
					}
					case 'trigger-file-id': {
						const trigger = form.commonTrigger;
						operand = { type, property, trigger };
						break;
					}
					case 'state-file-id': {
						const state = form.commonState;
						operand = { type, property, state };
						break;
					}
					case 'equipment-file-id':
					case 'equipment-slot': {
						const equipment = form.commonEquipment;
						operand = { type, property, equipment };
						break;
					}
					case 'item-file-id': {
						const item = form.commonItem;
						operand = { type, property, item };
						break;
					}
					case 'file-id': {
						const fileId = form.objectFileId;
						if (fileId === '') {
							return getFocus($('#setString-operand-object-fileId'));
						}
						operand = { type, property, fileId };
						break;
					}
				}
				break;
			}
			case 'element': {
				const property = form.elementProperty;
				const element = form.elementElement;
				operand = { type, property, element };
				break;
			}
			case 'list': {
				const variable = form.commonVariable;
				const index = form.listIndex;
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#setString-operand-common-variable'));
				}
				operand = { type, variable, index };
				break;
			}
			case 'parameter': {
				const key = form.parameterKey;
				if (key === '') {
					return getFocus($('#setString-operand-parameter-key'));
				}
				operand = { type, key };
				break;
			}
			case 'script': {
				const script = form.script.trim();
				if (script === '') {
					return getFocus($('#setString-operand-script'));
				}
				operand = { type, script };
				break;
			}
			case 'other': {
				const data = form.otherData;
				switch (data) {
					case 'showChoices-content': {
						const choiceIndex = form.showChoicesIndex;
						operand = { type, data, choiceIndex };
						break;
					}
					case 'parse-timestamp': {
						const variable = form.parseTimestampVariable;
						const format = form.parseTimestampFormat;
						if (VariableGetter.isNone!(variable)) {
							return getFocus($('#setString-operand-parse-timestamp-variable'));
						}
						operand = { type, data, variable, format };
						break;
					}
					case 'screenshot': {
						const width = form.screenshotWidth;
						const height = form.screenshotHeight;
						operand = { type, data, width, height };
						break;
					}
					default:
						operand = { type, data };
						break;
				}
				break;
			}
		}
		Command.save!({ variable, operation, operand });
	}
});
