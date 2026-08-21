import '@app/inspector/file-event-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface EventForm {
	type: string;
	enabled: boolean;
	priority: boolean;
	namespace: boolean;
	returnType: string;
	description: string;
}

const EVENT_KEYS: (keyof EventForm)[] = [
	'type',
	'enabled',
	'priority',
	'namespace',
	'returnType',
	'description'
];

export function useFileEventPage() {
	const form = reactive<Partial<EventForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileEvent?.target as Partial<EventForm> | null | undefined;
		if (!target) return;
		for (const key of EVENT_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileEvent-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileEvent.update(
				Inspector.fileEvent.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
