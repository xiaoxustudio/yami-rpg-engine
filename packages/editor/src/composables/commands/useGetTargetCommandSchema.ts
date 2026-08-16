import '@/module/command/getTarget.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGetTargetCommandSchema() {
	const { form, save, load } = useCommandSchema('getTarget', {
		onLoad() {
			const attrItems = Attribute.getAttributeItems!('actor', 'number');
			$('#getTarget-attribute')?.loadItems?.(attrItems);
			$('#getTarget-divisor')?.loadItems?.(attrItems);
			getFocus($('#getTarget-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#getTarget-actor')) ?? form.actor;
		const selector = read($('#getTarget-selector')) ?? form.selector;
		const condition = read($('#getTarget-condition')) ?? form.condition;
		switch (condition) {
			case 'max-threat':
			case 'nearest':
			case 'farthest':
			case 'random':
				Command.save?.({ actor, selector, condition });
				break;
			case 'min-attribute-value':
			case 'max-attribute-value': {
				const attribute = read($('#getTarget-attribute')) ?? form.attribute;
				if (attribute === '') {
					getFocus($('#getTarget-attribute'));
					return;
				}
				Command.save?.({ actor, selector, condition, attribute });
				break;
			}
			case 'min-attribute-ratio':
			case 'max-attribute-ratio': {
				const attribute = read($('#getTarget-attribute')) ?? form.attribute;
				const divisor = read($('#getTarget-divisor')) ?? form.divisor;
				if (attribute === '') {
					getFocus($('#getTarget-attribute'));
					return;
				}
				if (divisor === '') {
					getFocus($('#getTarget-divisor'));
					return;
				}
				Command.save?.({
					actor,
					selector,
					condition,
					attribute,
					divisor
				});
				break;
			}
		}
	};
	Command.cases.getTarget.customSave = onSave;
	return { form, save: onSave, load };
}
