import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

export type SetStringOperand = Record<string, any>;

Command.cases.setString = new CommandSchema({
	name: 'setString',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'operation', default: 'set' },
		{ key: 'operandType', domId: 'operand-type', default: 'constant' },
		{ key: 'commonValue', domId: 'operand-common-value', default: '' },
		{ key: 'stringMethod', domId: 'operand-string-method', default: 'char' },
		{
			key: 'commonVariable',
			domId: 'operand-common-variable',
			default: { type: 'local', key: '' }
		},
		{ key: 'stringCharIndex', domId: 'operand-string-char-index', default: 0 },
		{ key: 'stringSliceBegin', domId: 'operand-string-slice-begin', default: 0 },
		{ key: 'stringSliceEnd', domId: 'operand-string-slice-end', default: 0 },
		{ key: 'stringPadStartLength', domId: 'operand-string-pad-start-length', default: 2 },
		{ key: 'stringPadStartPad', domId: 'operand-string-pad-start-pad', default: '0' },
		{
			key: 'stringReplacePattern',
			domId: 'operand-string-replace-pattern',
			default: ''
		},
		{
			key: 'stringReplaceReplacement',
			domId: 'operand-string-replace-replacement',
			default: ''
		},
		{ key: 'attributeId', domId: 'operand-attribute-attributeId', default: '' },
		{ key: 'enumStringId', domId: 'operand-enum-stringId', default: '' },
		{ key: 'objectProperty', domId: 'operand-object-property', default: 'actor-team-id' },
		{ key: 'elementProperty', domId: 'operand-element-property', default: 'text-content' },
		{ key: 'elementElement', domId: 'operand-element-element', default: { type: 'trigger' } },
		{ key: 'commonActor', domId: 'operand-common-actor', default: { type: 'trigger' } },
		{ key: 'commonSkill', domId: 'operand-common-skill', default: { type: 'trigger' } },
		{ key: 'commonTrigger', domId: 'operand-common-trigger', default: { type: 'trigger' } },
		{ key: 'commonState', domId: 'operand-common-state', default: { type: 'trigger' } },
		{
			key: 'commonEquipment',
			domId: 'operand-common-equipment',
			default: { type: 'trigger' }
		},
		{ key: 'commonItem', domId: 'operand-common-item', default: { type: 'trigger' } },
		{ key: 'objectFileId', domId: 'operand-object-fileId', default: '' },
		{ key: 'listIndex', domId: 'operand-list-index', default: 0 },
		{ key: 'parameterKey', domId: 'operand-parameter-key', default: '' },
		{ key: 'script', domId: 'operand-script', default: '' },
		{ key: 'otherData', domId: 'operand-other-data', default: 'trigger-key' },
		{
			key: 'showChoicesIndex',
			domId: 'operand-showChoices-content-choiceIndex',
			default: 0
		},
		{
			key: 'parseTimestampVariable',
			domId: 'operand-parse-timestamp-variable',
			default: { type: 'local', key: '' }
		},
		{
			key: 'parseTimestampFormat',
			domId: 'operand-parse-timestamp-format',
			default: '{Y}-{M}-{D} {h}:{m}:{s}'
		},
		{ key: 'screenshotWidth', domId: 'operand-screenshot-width', default: 320 },
		{ key: 'screenshotHeight', domId: 'operand-screenshot-height', default: 180 }
	],
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
		const methodName = t('command.setString.string.' + method);
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
		const property = t('command.setString.object.' + operand.property);
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
		const property = t('command.setString.element.' + operand.property);
		return element + Token(' -> ') + property.replace('.', Token('.'));
	},
	parseOther(operand: SetStringOperand) {
		const label = t('command.setString.other.' + operand.data).replace('.', Token('.'));
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
				const label = t('command.setString.other.showChoices-content');
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
			{ text: t('command.setString.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		];
	}
});
