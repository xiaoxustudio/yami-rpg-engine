import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { registryElement } from '@app/utils/element-registry';

// oxlint-disable-next-line no-explicit-any
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

export function useSetStringCommandSchema() {
	const { form, load, commit } = useCommandSchema('setString', {
		skipWrite: true,
		onLoad() {
			requestFocus('setString-variable');
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const operand = (params.operand ?? { type: 'constant', value: '' }) as SetStringOperand;
		const data: Record<string, unknown> = {
			variable: params.variable ?? { type: 'local', key: '' },
			operation: params.operation ?? 'set',
			operandType: operand.type
		};
		switch (operand.type) {
			case 'constant':
			case 'template':
				data.commonValue = operand.value;
				break;
			case 'variable':
				data.commonVariable = operand.variable;
				break;
			case 'string':
				data.stringMethod = operand.method;
				data.commonVariable = operand.variable;
				data.stringCharIndex = operand.index ?? 0;
				data.stringSliceBegin = operand.begin ?? 0;
				data.stringSliceEnd = operand.end ?? 0;
				data.stringPadStartLength = operand.length ?? 2;
				data.stringPadStartPad = operand.pad ?? '0';
				data.stringReplacePattern = operand.pattern ?? '';
				data.stringReplaceReplacement = operand.replacement ?? '';
				break;
			case 'attribute':
				data.attributeId = operand.attributeId;
				break;
			case 'enum':
				data.enumStringId = operand.stringId;
				break;
			case 'object':
				data.objectProperty = operand.property;
				data.commonActor = operand.actor ?? { type: 'trigger' };
				data.commonSkill = operand.skill ?? { type: 'trigger' };
				data.commonTrigger = operand.trigger ?? { type: 'trigger' };
				data.commonState = operand.state ?? { type: 'trigger' };
				data.commonEquipment = operand.equipment ?? { type: 'trigger' };
				data.commonItem = operand.item ?? { type: 'trigger' };
				data.objectFileId = operand.fileId ?? '';
				break;
			case 'element':
				data.elementProperty = operand.property;
				data.elementElement = operand.element;
				break;
			case 'list':
				data.commonVariable = operand.variable;
				data.listIndex = operand.index;
				break;
			case 'parameter':
				data.parameterKey = operand.key;
				break;
			case 'script':
				data.script = operand.script;
				break;
			case 'other': {
				let otherData = operand.data;
				let showChoicesIndex = operand.choiceIndex ?? 0;
				if (
					otherData === 'showChoices-content-0' ||
					otherData === 'showChoices-content-1' ||
					otherData === 'showChoices-content-2' ||
					otherData === 'showChoices-content-3'
				) {
					showChoicesIndex = parseInt(otherData.slice(-1));
					otherData = 'showChoices-content';
				}
				data.otherData = otherData;
				data.showChoicesIndex = showChoicesIndex;
				data.parseTimestampVariable = operand.variable ?? { type: 'local', key: '' };
				data.parseTimestampFormat = operand.format ?? '{Y}-{M}-{D} {h}:{m}:{s}';
				data.screenshotWidth = operand.width ?? 320;
				data.screenshotHeight = operand.height ?? 180;
				break;
			}
		}
		load(data);
	};
	const onSave = (): void => {
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			requestFocus('setString-variable');
			return;
		}
		const operation = form.operation as string;
		const type = form.operandType as string;
		let operand: SetStringOperand = { type };
		switch (type) {
			case 'constant':
			case 'template': {
				const value = form.commonValue as string;
				operand = { type, value };
				break;
			}
			case 'variable': {
				const variable = form.commonVariable;
				if (VariableGetter.isNone!(variable as { key: string })) {
					requestFocus('setString-operand-common-variable');
					return;
				}
				operand = { type, variable: variable as { type: string; key: string } };
				break;
			}
			case 'string': {
				const method = form.stringMethod as string;
				const variable = form.commonVariable;
				if (VariableGetter.isNone!(variable as { key: string })) {
					requestFocus('setString-operand-common-variable');
					return;
				}
				const varRef = variable as { type: string; key: string };
				switch (method) {
					case 'char': {
						const index = form.stringCharIndex as number;
						operand = { type, method, variable: varRef, index };
						break;
					}
					case 'slice': {
						const begin = form.stringSliceBegin as number;
						const end = form.stringSliceEnd as number;
						operand = { type, method, variable: varRef, begin, end };
						break;
					}
					case 'pad-start': {
						const length = form.stringPadStartLength as number;
						const pad = form.stringPadStartPad as string;
						operand = { type, method, variable: varRef, length, pad };
						break;
					}
					case 'replace':
					case 'replace-all': {
						const pattern = form.stringReplacePattern as string;
						if (pattern === '') {
							requestFocus('setString-operand-string-replace-pattern');
							return;
						}
						const replacement = form.stringReplaceReplacement as string;
						operand = { type, method, variable: varRef, pattern, replacement };
						break;
					}
				}
				break;
			}
			case 'attribute': {
				const attributeId = form.attributeId as string;
				if (attributeId === '') {
					requestFocus('setString-operand-attribute-attributeId');
					return;
				}
				operand = { type, attributeId };
				break;
			}
			case 'enum': {
				const stringId = form.enumStringId as string;
				if (stringId === '') {
					requestFocus('setString-operand-enum-stringId');
					return;
				}
				operand = { type, stringId };
				break;
			}
			case 'object': {
				const property = form.objectProperty as string;
				switch (property) {
					case 'actor-team-id':
					case 'actor-file-id':
					case 'actor-animation-motion-name': {
						const actor = form.commonActor;
						operand = { type, property, actor: actor as { type: string } };
						break;
					}
					case 'skill-file-id': {
						const skill = form.commonSkill;
						operand = { type, property, skill: skill as { type: string } };
						break;
					}
					case 'trigger-file-id': {
						const trigger = form.commonTrigger;
						operand = { type, property, trigger: trigger as { type: string } };
						break;
					}
					case 'state-file-id': {
						const state = form.commonState;
						operand = { type, property, state: state as { type: string } };
						break;
					}
					case 'equipment-file-id':
					case 'equipment-slot': {
						const equipment = form.commonEquipment;
						operand = { type, property, equipment: equipment as { type: string } };
						break;
					}
					case 'item-file-id': {
						const item = form.commonItem;
						operand = { type, property, item: item as { type: string } };
						break;
					}
					case 'file-id': {
						const fileId = form.objectFileId as string;
						if (fileId === '') {
							requestFocus('setString-operand-object-fileId');
							return;
						}
						operand = { type, property, fileId };
						break;
					}
				}
				break;
			}
			case 'element': {
				const property = form.elementProperty as string;
				const element = form.elementElement;
				operand = { type, property, element: element as { type: string } };
				break;
			}
			case 'list': {
				const variable = form.commonVariable;
				if (VariableGetter.isNone!(variable as { key: string })) {
					requestFocus('setString-operand-common-variable');
					return;
				}
				const index = form.listIndex as number;
				operand = { type, variable: variable as { type: string; key: string }, index };
				break;
			}
			case 'parameter': {
				const key = form.parameterKey as string;
				if (key === '') {
					requestFocus('setString-operand-parameter-key');
					return;
				}
				operand = { type, key };
				break;
			}
			case 'script': {
				const script = (form.script as string).trim();
				if (script === '') {
					requestFocus('setString-operand-script');
					return;
				}
				operand = { type, script };
				break;
			}
			case 'other': {
				const data = form.otherData as string;
				switch (data) {
					case 'showChoices-content': {
						const choiceIndex = form.showChoicesIndex as number;
						operand = { type, data, choiceIndex };
						break;
					}
					case 'parse-timestamp': {
						const variable = form.parseTimestampVariable;
						if (VariableGetter.isNone!(variable as { key: string })) {
							requestFocus('setString-operand-parse-timestamp-variable');
							return;
						}
						const format = form.parseTimestampFormat as string;
						operand = {
							type,
							data,
							variable: variable as { type: string; key: string },
							format
						};
						break;
					}
					case 'screenshot': {
						const width = form.screenshotWidth as number;
						const height = form.screenshotHeight as number;
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
		commit({ variable, operation, operand });
	};
	const writeHandler = (event: { value: string }): void => {
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
		const element = registryElement<HTMLElement & { filter?: string }>(
			composableEls,
			'setString-operand-common-variable'
		);
		if (element) {
			element.filter = filter;
		}
	};
	Command.cases.setString.customLoad = onLoad;
	Command.cases.setString.customSave = onSave;
	return { form, save: onSave, load: onLoad, writeHandler };
}
