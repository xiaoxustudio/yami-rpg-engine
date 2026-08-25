import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.loadScene = new CommandSchema({
	name: 'loadScene',
	fields: [
		{ key: 'sceneId', default: '' },
		{ key: 'transfer', default: true },
		{ key: 'x', default: 0 },
		{ key: 'y', default: 0 }
	],
	customParse({
		sceneId,
		transfer,
		x,
		y
	}: {
		sceneId: unknown;
		transfer: unknown;
		x: unknown;
		y: unknown;
	}) {
		const words = Command.words.push(Command.parseVariableFile!(sceneId));
		if (transfer) {
			words.push(Command.parseVariableNumber!(x)).push(Command.parseVariableNumber!(y));
		}
		return [
			{ color: 'scene' },
			{ text: t('command.loadScene') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useLoadSceneCommandSchema() {
	const { form, load, commit } = useCommandSchema('loadScene', {
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
				commit({
					sceneId,
					transfer,
					x: read(document.getElementById('loadScene-x')!) ?? form.x,
					y: read(document.getElementById('loadScene-y')!) ?? form.y
				});
				break;
			case false:
				commit({ sceneId, transfer });
				break;
		}
	};
	Command.cases.loadScene.customSave = onSave;
	return { form, save: onSave, load };
}
