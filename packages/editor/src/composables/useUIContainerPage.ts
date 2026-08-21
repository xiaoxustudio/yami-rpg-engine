import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

export function useUIContainerPage() {
	const form = reactive<Record<string, never>>({});

	const sync = (): void => {
		const target = Inspector?.uiContainer?.target;
		if (!target) return;
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiContainer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiElement.update(
				Inspector.uiElement.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
