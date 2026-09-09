/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	customParse({ actor, teamId }: { actor: unknown; teamId: unknown }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseTeam!(teamId));
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeActorTeamCommandSchema() {
	return useCommandSchema('changeActorTeam', {
		skipWrite: true,
		onLoad() {
			// 每次打开（插入/编辑）都按当前队伍数据刷新下拉，避免依赖窗口 open 事件导致默认无文本
			document.getElementById('changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
			requestFocus('changeActorTeam-actor');
		}
	});
}
