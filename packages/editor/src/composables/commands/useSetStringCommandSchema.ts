import '@app/legacy/module/command/setString.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import type { SetStringOperand } from '@app/legacy/module/command/setString.ts';

export function useSetStringCommandSchema() {
	const { form, save, load } = useCommandSchema('setString', {
		onLoad() {
			getFocus(document.getElementById('setString-variable'));
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
		const variable = read(document.getElementById('setString-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('setString-variable'));
			return;
		}
		const operation = (read(document.getElementById('setString-operation')) ??
			form.operation) as string;
		const type = (read(document.getElementById('setString-operand-type')) ??
			form.operandType) as string;
		let operand: SetStringOperand = { type };
		switch (type) {
			case 'constant':
			case 'template': {
				const value = (read(document.getElementById('setString-operand-common-value')) ??
					form.commonValue) as string;
				operand = { type, value };
				break;
			}
			case 'variable': {
				const variable =
					read(document.getElementById('setString-operand-common-variable')) ??
					form.commonVariable;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('setString-operand-common-variable'));
					return;
				}
				operand = { type, variable: variable as { type: string; key: string } };
				break;
			}
			case 'string': {
				const method = (read(document.getElementById('setString-operand-string-method')) ??
					form.stringMethod) as string;
				const variable =
					read(document.getElementById('setString-operand-common-variable')) ??
					form.commonVariable;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('setString-operand-common-variable'));
					return;
				}
				const varRef = variable as { type: string; key: string };
				switch (method) {
					case 'char': {
						const index = (read(
							document.getElementById('setString-operand-string-char-index')
						) ?? form.stringCharIndex) as number;
						operand = { type, method, variable: varRef, index };
						break;
					}
					case 'slice': {
						const begin = (read(
							document.getElementById('setString-operand-string-slice-begin')
						) ?? form.stringSliceBegin) as number;
						const end = (read(
							document.getElementById('setString-operand-string-slice-end')
						) ?? form.stringSliceEnd) as number;
						operand = { type, method, variable: varRef, begin, end };
						break;
					}
					case 'pad-start': {
						const length = (read(
							document.getElementById('setString-operand-string-pad-start-length')
						) ?? form.stringPadStartLength) as number;
						const pad = (read(
							document.getElementById('setString-operand-string-pad-start-pad')
						) ?? form.stringPadStartPad) as string;
						operand = { type, method, variable: varRef, length, pad };
						break;
					}
					case 'replace':
					case 'replace-all': {
						const pattern = (read(
							document.getElementById('setString-operand-string-replace-pattern')
						) ?? form.stringReplacePattern) as string;
						if (pattern === '') {
							getFocus(
								document.getElementById('setString-operand-string-replace-pattern')
							);
							return;
						}
						const replacement = (read(
							document.getElementById('setString-operand-string-replace-replacement')
						) ?? form.stringReplaceReplacement) as string;
						operand = { type, method, variable: varRef, pattern, replacement };
						break;
					}
				}
				break;
			}
			case 'attribute': {
				const attributeId = (read(
					document.getElementById('setString-operand-attribute-attributeId')
				) ?? form.attributeId) as string;
				if (attributeId === '') {
					getFocus(document.getElementById('setString-operand-attribute-attributeId'));
					return;
				}
				operand = { type, attributeId };
				break;
			}
			case 'enum': {
				const stringId = (read(
					document.getElementById('setString-operand-enum-stringId')
				) ?? form.enumStringId) as string;
				if (stringId === '') {
					getFocus(document.getElementById('setString-operand-enum-stringId'));
					return;
				}
				operand = { type, stringId };
				break;
			}
			case 'object': {
				const property = (read(
					document.getElementById('setString-operand-object-property')
				) ?? form.objectProperty) as string;
				switch (property) {
					case 'actor-team-id':
					case 'actor-file-id':
					case 'actor-animation-motion-name': {
						const actor =
							read(document.getElementById('setString-operand-common-actor')) ??
							form.commonActor;
						operand = { type, property, actor: actor as { type: string } };
						break;
					}
					case 'skill-file-id': {
						const skill =
							read(document.getElementById('setString-operand-common-skill')) ??
							form.commonSkill;
						operand = { type, property, skill: skill as { type: string } };
						break;
					}
					case 'trigger-file-id': {
						const trigger =
							read(document.getElementById('setString-operand-common-trigger')) ??
							form.commonTrigger;
						operand = { type, property, trigger: trigger as { type: string } };
						break;
					}
					case 'state-file-id': {
						const state =
							read(document.getElementById('setString-operand-common-state')) ??
							form.commonState;
						operand = { type, property, state: state as { type: string } };
						break;
					}
					case 'equipment-file-id':
					case 'equipment-slot': {
						const equipment =
							read(document.getElementById('setString-operand-common-equipment')) ??
							form.commonEquipment;
						operand = { type, property, equipment: equipment as { type: string } };
						break;
					}
					case 'item-file-id': {
						const item =
							read(document.getElementById('setString-operand-common-item')) ??
							form.commonItem;
						operand = { type, property, item: item as { type: string } };
						break;
					}
					case 'file-id': {
						const fileId = (read(
							document.getElementById('setString-operand-object-fileId')
						) ?? form.objectFileId) as string;
						if (fileId === '') {
							getFocus(document.getElementById('setString-operand-object-fileId'));
							return;
						}
						operand = { type, property, fileId };
						break;
					}
				}
				break;
			}
			case 'element': {
				const property = (read(
					document.getElementById('setString-operand-element-property')
				) ?? form.elementProperty) as string;
				const element =
					read(document.getElementById('setString-operand-element-element')) ??
					form.elementElement;
				operand = { type, property, element: element as { type: string } };
				break;
			}
			case 'list': {
				const variable =
					read(document.getElementById('setString-operand-common-variable')) ??
					form.commonVariable;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('setString-operand-common-variable'));
					return;
				}
				const index = (read(document.getElementById('setString-operand-list-index')) ??
					form.listIndex) as number;
				operand = { type, variable: variable as { type: string; key: string }, index };
				break;
			}
			case 'parameter': {
				const key = (read(document.getElementById('setString-operand-parameter-key')) ??
					form.parameterKey) as string;
				if (key === '') {
					getFocus(document.getElementById('setString-operand-parameter-key'));
					return;
				}
				operand = { type, key };
				break;
			}
			case 'script': {
				const script = (
					(read(document.getElementById('setString-operand-script')) ??
						form.script) as string
				).trim();
				if (script === '') {
					getFocus(document.getElementById('setString-operand-script'));
					return;
				}
				operand = { type, script };
				break;
			}
			case 'other': {
				const data = (read(document.getElementById('setString-operand-other-data')) ??
					form.otherData) as string;
				switch (data) {
					case 'showChoices-content': {
						const choiceIndex = (read(
							document.getElementById(
								'setString-operand-showChoices-content-choiceIndex'
							)
						) ?? form.showChoicesIndex) as number;
						operand = { type, data, choiceIndex };
						break;
					}
					case 'parse-timestamp': {
						const variable =
							read(
								document.getElementById(
									'setString-operand-parse-timestamp-variable'
								)
							) ?? form.parseTimestampVariable;
						if (VariableGetter.isNone!(variable)) {
							getFocus(
								document.getElementById(
									'setString-operand-parse-timestamp-variable'
								)
							);
							return;
						}
						const format = (read(
							document.getElementById('setString-operand-parse-timestamp-format')
						) ?? form.parseTimestampFormat) as string;
						operand = {
							type,
							data,
							variable: variable as { type: string; key: string },
							format
						};
						break;
					}
					case 'screenshot': {
						const width = (read(
							document.getElementById('setString-operand-screenshot-width')
						) ?? form.screenshotWidth) as number;
						const height = (read(
							document.getElementById('setString-operand-screenshot-height')
						) ?? form.screenshotHeight) as number;
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
		Command.save?.({ variable, operation, operand });
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
		const element = document.getElementById('setString-operand-common-variable') as
			| (HTMLElement & { filter?: string })
			| null;
		if (element) {
			element.filter = filter;
		}
	};
	Command.cases.setString.customLoad = onLoad;
	Command.cases.setString.customSave = onSave;
	return { form, save: onSave, load: onLoad, writeHandler };
}
