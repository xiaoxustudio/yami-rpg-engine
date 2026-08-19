import '@app/legacy/module/command/changeActorPortrait.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorPortraitCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorPortrait', {
		onLoad() {
			getFocus(document.getElementById('changeActorPortrait-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('changeActorPortrait-actor')) ?? form.actor;
		const mode = read(document.getElementById('changeActorPortrait-mode')) ?? form.mode;
		const portrait =
			read(document.getElementById('changeActorPortrait-portrait')) ?? form.portrait;
		const clip = read(document.getElementById('changeActorPortrait-clip')) ?? form.clip;
		switch (mode) {
			case 'full':
				Command.save?.({ actor, mode, portrait, clip });
				break;
			case 'portrait':
				Command.save?.({ actor, mode, portrait });
				break;
			case 'clip':
				Command.save?.({ actor, mode, clip });
				break;
		}
	};
	Command.cases.changeActorPortrait.customSave = onSave;
	return { form, save: onSave, load };
}
