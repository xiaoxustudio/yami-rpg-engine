import '@app/legacy/inspector/file-entity-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/legacy/util/element-utils';

interface EntityForm {
	icon: string;
	clip: number[];
	inherit: string;
}

const ENTITY_KEYS: (keyof EntityForm)[] = ['icon', 'clip', 'inherit'];

export function useFileSkillPage() {
	const form = reactive<Partial<EntityForm>>({});

	const sync = (): void => {
		const target = Inspector?.fileSkill?.target as Partial<EntityForm> | null | undefined;
		if (!target) return;
		for (const key of ENTITY_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileSkill-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileSkill.update(
				Inspector.fileSkill.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
