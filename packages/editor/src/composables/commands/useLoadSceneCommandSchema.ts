import '@/module/command/loadScene.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadSceneCommandSchema() {
	const { form, save, load } = useCommandSchema('loadScene', {
		onLoad() {
			getFocus($('#loadScene-sceneId'));
		}
	});
	const onSave = (): void => {
		const sceneId = read($('#loadScene-sceneId')) ?? form.sceneId;
		if (sceneId === '') {
			getFocus($('#loadScene-sceneId'));
			return;
		}
		const transfer = read($('#loadScene-transfer')) ?? form.transfer;
		switch (transfer) {
			case true:
				Command.save!({
					sceneId,
					transfer,
					x: read($('#loadScene-x')) ?? form.x,
					y: read($('#loadScene-y')) ?? form.y
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
