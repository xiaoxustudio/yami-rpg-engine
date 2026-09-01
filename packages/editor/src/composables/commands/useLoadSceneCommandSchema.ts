/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('loadScene-sceneId');
		}
	});
	const onSave = (): void => {
		const sceneId = form.sceneId as string;
		if (sceneId === '') {
			requestFocus('loadScene-sceneId');
			return;
		}
		const transfer = form.transfer as boolean;
		switch (transfer) {
			case true:
				commit({
					sceneId,
					transfer,
					x: form.x,
					y: form.y
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
