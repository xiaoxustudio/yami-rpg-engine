import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface ReferenceForm {
	prefabId: string;
	synchronous: boolean;
}

const REFERENCE_KEYS: (keyof ReferenceForm)[] = ['prefabId', 'synchronous'];

export function useUIReferencePage() {
	const form = reactive<Partial<ReferenceForm>>({});

	const sync = (): void => {
		const target = Inspector?.uiReference?.target as Partial<ReferenceForm> | null | undefined;
		if (!target) return;
		for (const key of REFERENCE_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiReference-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiReference.update(
				Inspector.uiReference.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
