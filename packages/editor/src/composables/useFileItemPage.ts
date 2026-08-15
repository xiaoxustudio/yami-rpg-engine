import { reactive } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { read } from '@/util/element-utils';

interface EntityForm {
	icon: string;
	clip: number[];
	inherit: string;
}

const ENTITY_KEYS: (keyof EntityForm)[] = ['icon', 'clip', 'inherit'];

export function useFileItemPage() {
	const form = reactive<Partial<EntityForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileItem?.target as Partial<EntityForm> | null | undefined;
		if (!target) return;
		for (const key of ENTITY_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileItem-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileItem.update(
				Inspector.fileItem.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
