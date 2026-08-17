import '@app/legacy/module/command/stopEvent.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopEventCommandSchema() {
	const { form, save, load } = useCommandSchema('stopEvent', {
		onLoad() {
			getFocus($('#stopEvent-type'));
		}
	});
	const onSave = (): void => {
		const type = read($('#stopEvent-type')) ?? form.type;
		switch (type) {
			case 'current':
				Command.save?.({ type });
				break;
			case 'global': {
				const eventId = read($('#stopEvent-eventId')) ?? form.eventId;
				if (eventId === '') {
					getFocus($('#stopEvent-eventId'));
					return;
				}
				Command.save?.({ type, eventId });
				break;
			}
			case 'scene': {
				const eventType = read($('#stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus($('#stopEvent-eventType'));
					return;
				}
				Command.save?.({ type, eventType });
				break;
			}
			default: {
				const target = read($('#' + 'stopEvent-' + type)) ?? form[type];
				const eventType = read($('#stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus($('#stopEvent-eventType'));
					return;
				}
				Command.save?.({
					type,
					[type]: target,
					eventType
				});
				break;
			}
		}
	};
	Command.cases.stopEvent.customSave = onSave;
	return { form, save: onSave, load };
}
