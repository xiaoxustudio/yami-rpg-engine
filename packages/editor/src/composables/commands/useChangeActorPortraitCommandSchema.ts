import '@app/legacy/module/command/changeActorPortrait.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorPortraitCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorPortrait', {
		onLoad() {
			getFocus($('#changeActorPortrait-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#changeActorPortrait-actor')) ?? form.actor;
		const mode = read($('#changeActorPortrait-mode')) ?? form.mode;
		const portrait = read($('#changeActorPortrait-portrait')) ?? form.portrait;
		const clip = read($('#changeActorPortrait-clip')) ?? form.clip;
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
