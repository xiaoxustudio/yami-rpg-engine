import '@app/legacy/module/command/loadScene.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadSceneCommandSchema() {
	const { form, save, load } = useCommandSchema('loadScene', {
		onLoad() {
			getFocus(document.getElementById('loadScene-sceneId')!);
		}
	});
	const onSave = (): void => {
		const sceneId = read(document.getElementById('loadScene-sceneId')!) ?? form.sceneId;
		if (sceneId === '') {
			getFocus(document.getElementById('loadScene-sceneId')!);
			return;
		}
		const transfer = read(document.getElementById('loadScene-transfer')!) ?? form.transfer;
		switch (transfer) {
			case true:
				Command.save!({
					sceneId,
					transfer,
					x: read(document.getElementById('loadScene-x')!) ?? form.x,
					y: read(document.getElementById('loadScene-y')!) ?? form.y
				});
				break;
			case false:
				Command.save!({ sceneId, transfer });
				break;
		}
	};
	Command.cases.loadScene.customSave = onSave;
	return { form, save: onSave, load };
}
