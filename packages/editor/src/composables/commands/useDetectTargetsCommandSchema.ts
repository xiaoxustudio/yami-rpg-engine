import '@app/legacy/module/command/detectTargets.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDetectTargetsCommandSchema() {
	const { form, save, load } = useCommandSchema('detectTargets', {
		onLoad() {
			getFocus(document.getElementById('detectTargets-actor')!);
		}
	});
	const onSave = (): void => {
		const distance = read(document.getElementById('detectTargets-distance')!) ?? form.distance;
		if (distance === 0) {
			getFocus(document.getElementById('detectTargets-distance')!, 'all');
			return;
		}
		save();
	};
	Command.cases.detectTargets.customSave = onSave;
	return { form, save: onSave, load };
}
