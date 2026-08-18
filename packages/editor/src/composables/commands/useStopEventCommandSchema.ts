import '@app/legacy/module/command/stopEvent.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopEventCommandSchema() {
	const { form, save, load } = useCommandSchema('stopEvent', {
		onLoad() {
			getFocus(document.getElementById('stopEvent-type'));
		}
	});
	const onSave = (): void => {
		const type = read(document.getElementById('stopEvent-type')) ?? form.type;
		switch (type) {
			case 'current':
				Command.save?.({ type });
				break;
			case 'global': {
				const eventId = read(document.getElementById('stopEvent-eventId')) ?? form.eventId;
				if (eventId === '') {
					getFocus(document.getElementById('stopEvent-eventId'));
					return;
				}
				Command.save?.({ type, eventId });
				break;
			}
			case 'scene': {
				const eventType =
					read(document.getElementById('stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus(document.getElementById('stopEvent-eventType'));
					return;
				}
				Command.save?.({ type, eventType });
				break;
			}
			default: {
				const target = read(document.getElementById('stopEvent-' + type)) ?? form[type];
				const eventType =
					read(document.getElementById('stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus(document.getElementById('stopEvent-eventType'));
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
