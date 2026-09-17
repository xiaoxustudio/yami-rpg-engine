import { read } from '@app/utils/element-utils';
import { composableEls } from '@app/composables/element-registry';
import { Command } from '@app/commands/command-object.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';
import type { YamiElement } from '@app/types/element-api';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

type PlayAnimationCommandData = {
	mode: string;
	position: unknown;
	actor: unknown;
	animationId: string;
	motion: string;
	rotatable: boolean;
	priority: number;
	offsetY: number | string;
	angle: unknown;
	speed: unknown;
	wait: unknown;
};

Command.cases.playAnimation = new CommandSchema({
	name: 'playAnimation',
	fields: [
		{ key: 'mode', default: 'position' },
		{ key: 'position', default: { type: 'actor', actor: { type: 'trigger' } } },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '' },
		{ key: 'motion', default: '' },
		{ key: 'rotatable', default: false },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 },
		{ key: 'angle', default: 0 },
		{ key: 'speed', default: 1 },
		{ key: 'wait', default: false }
	],
	parseRotatable(rotatable: boolean) {
		return rotatable ? t('command.playAnimation.rotatable') : '';
	},
	parsePriority(priority: number) {
		if (priority === 0) return '';
		const abs = Command.setNumberColor!(Math.abs(priority));
		return priority > 0 ? Token('+') + abs : Token('-') + abs;
	},
	parseOffsetY(offsetY: number | string) {
		let num;
		if (typeof offsetY === 'number') num = Command.setNumberColor!(Math.abs(offsetY)) + 'px';
		return typeof offsetY === 'number'
			? offsetY > 0
				? num
				: Token('-') + num
			: Command.parseVariableNumber!(offsetY);
	},
	customParse({
		mode,
		position,
		actor,
		animationId,
		motion,
		rotatable,
		priority,
		offsetY,
		angle,
		speed,
		wait
	}: PlayAnimationCommandData) {
		const words = Command.words;
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition!(position));
				break;
			case 'actor': {
				const bind = t('command.playAnimation.bind');
				words.push(bind + Token('(') + Command.parseActor!(actor) + Token(')'));
				break;
			}
		}
		words
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion))
			.push(this.parseRotatable!(rotatable))
			.push(this.parsePriority!(priority))
			.push(this.parseOffsetY!(offsetY))
			.push(Command.parseVariableNumber!(angle, '°'))
			.push(Command.parseVariableNumber!(speed))
			.push(Command.parseWait!(wait));
		return [
			{ color: 'object' },
			{ text: t('command.playAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function usePlayAnimationCommandSchema() {
	const { form, load, commit } = useCommandSchema('playAnimation', {
		skipWrite: true,
		onLoad() {
			requestFocus('playAnimation-mode');
		}
	});
	const writeHandler = (event: { value: string }): void => {
		if (!event.value) return;
		const elMotion = composableEls.get('playAnimation-motion') as YamiElement;
		elMotion?.loadItems?.(Animation.getMotionListItems!(event.value));
		elMotion?.write2?.(read(elMotion));
	};
	const onSave = (): void => {
		const mode = form.mode as string;
		const animationId = form.animationId as string;
		const motion = form.motion as string;
		const rotatable = form.rotatable;
		const priority = form.priority;
		const offsetY = form.offsetY;
		const angle = form.angle;
		const speed = form.speed;
		const wait = form.wait;
		if (animationId === '') {
			requestFocus('playAnimation-animationId');
			return;
		}
		if (motion === '') {
			requestFocus('playAnimation-motion');
			return;
		}
		switch (mode) {
			case 'position':
				commit({
					mode,
					position: form.position,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
			case 'actor':
				commit({
					mode,
					actor: form.actor,
					animationId,
					motion,
					rotatable,
					priority,
					offsetY,
					angle,
					speed,
					wait
				});
				break;
		}
	};
	Command.cases.playAnimation.customSave = onSave;
	return { form, save: onSave, load, writeHandler };
}
