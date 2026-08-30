/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.addAnimationComponent = new CommandSchema({
	name: 'addAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true },
		{ key: 'rotatable', default: false },
		{ key: 'syncAngle', default: false },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 }
	],
	parseRotatable(rotatable: boolean) {
		return rotatable ? t('command.addAnimationComponent.rotatable') : '';
	},
	parseSyncAngle(syncAngle: boolean) {
		return syncAngle ? t('command.addAnimationComponent.syncAngle') : '';
	},
	parsePriority(priority: number) {
		if (priority === 0) return '';
		const abs = Command.setNumberColor!(Math.abs(priority));
		return priority > 0 ? Token('+') + abs : Token('-') + abs;
	},
	parseOffsetY(offsetY: number) {
		if (offsetY === 0) return '';
		const abs = Command.setNumberColor!(Math.abs(offsetY)) + 'px';
		return offsetY > 0 ? abs : Token('-') + abs;
	},
	customParse({
		actor,
		animationId,
		motion,
		rotatable,
		syncAngle,
		priority,
		offsetY
	}: {
		actor: unknown;
		animationId: unknown;
		motion: unknown;
		rotatable: boolean;
		syncAngle: boolean;
		priority: number;
		offsetY: number;
	}) {
		syncAngle = syncAngle ?? false;
		offsetY = offsetY ?? 0;
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion))
			.push(this.parseRotatable!(rotatable))
			.push(this.parseSyncAngle!(syncAngle))
			.push(this.parsePriority!(priority))
			.push(this.parseOffsetY!(offsetY));
		return [
			{ color: 'actor' },
			{ text: t('command.addAnimationComponent') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useAddAnimationComponentCommandSchema() {
	const { form, save, load } = useCommandSchema('addAnimationComponent', {
		onLoad() {
			getFocus(document.getElementById('addAnimationComponent-actor'));
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = document.getElementById('addAnimationComponent-motion')!;
		elMotion.loadItems(Animation.getMotionListItems!(event.value));
		elMotion.write2(read(elMotion));
	};
	return { form, save, load, writeHandler };
}
