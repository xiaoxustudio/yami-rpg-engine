import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
