/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus, read } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type SetAnimationComponentData = {
	actor: unknown;
	animationId: string;
	motion: string;
	operation: string;
	angle: unknown;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
	offsetY: number;
	spriteId: string;
	image: string;
	playMotion: string;
	wait: boolean;
};

Command.cases.setAnimationComponent = new CommandSchema({
	name: 'setAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '' },
		{ key: 'motion', default: '' },
		{ key: 'operation', default: 'set-angle' },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'scale', default: 1 },
		{ key: 'speed', default: 1 },
		{ key: 'opacity', default: 1 },
		{ key: 'priority', default: 0 },
		{ key: 'offsetY', default: 0 },
		{ key: 'spriteId', default: '' },
		{ key: 'image', default: '' },
		{ key: 'playMotion', default: '' },
		{ key: 'wait', default: false }
	],
	parsePriority(priority: number) {
		const abs = Command.setNumberColor!(Math.abs(priority));
		return priority === 0 ? abs : priority > 0 ? Token('+') + abs : Token('-') + abs;
	},
	parseOffsetY(offsetY: number) {
		const abs = Command.setNumberColor!(Math.abs(offsetY)) + 'px';
		return offsetY >= 0 ? abs : Token('-') + abs;
	},
	customParse({
		actor,
		animationId,
		motion,
		operation,
		angle,
		scale,
		speed,
		opacity,
		priority,
		offsetY,
		spriteId,
		image,
		playMotion,
		wait
	}: SetAnimationComponentData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseFileName!(animationId))
			.push(Command.parseEnumString!(motion))
			.push(t('command.setAnimationComponent.' + operation));
		switch (operation) {
			case 'set-angle':
				words.push(Command.parseAngle!(angle));
				break;
			case 'set-scale':
				words.push(Command.parseVariableNumber!(scale));
				break;
			case 'set-speed':
				words.push(Command.parseVariableNumber!(speed));
				break;
			case 'set-opacity':
				words.push(Command.parseVariableNumber!(opacity));
				break;
			case 'set-priority':
				words.push(this.parsePriority!(priority));
				break;
			case 'set-offsetY':
				words.push(this.parseOffsetY!(offsetY));
				break;
			case 'set-sprite':
				words.push(Command.parseSpriteName!(animationId, spriteId));
				words.push(Command.parseFileName!(image));
				break;
			case 'play-motion':
				words.push(Command.parseEnumString!(playMotion));
				words.push(Command.parseWait!(wait));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.setAnimationComponent') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetAnimationComponentCommandSchema() {
	const { form, load, commit } = useCommandSchema('setAnimationComponent', {
		onLoad() {
			getFocus(document.getElementById('setAnimationComponent-actor'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const animationId = (params.animationId ?? '') as string;
		if (animationId !== '') {
			document
				.getElementById('setAnimationComponent-motion')
				?.loadItems?.(Animation.getMotionListItems!(animationId));
			document
				.getElementById('setAnimationComponent-playMotion')
				?.loadItems?.(Animation.getMotionListItems!(animationId));
			document
				.getElementById('setAnimationComponent-spriteId')
				?.loadItems?.(Animation.getSpriteListItems!(animationId));
		}
		load(params);
	};
	const onSave = (): void => {
		const actor = read(document.getElementById('setAnimationComponent-actor')) ?? form.actor;
		const animationId =
			read(document.getElementById('setAnimationComponent-animationId')) ?? form.animationId;
		if (animationId === '') {
			getFocus(document.getElementById('setAnimationComponent-animationId'));
			return;
		}
		const motion = read(document.getElementById('setAnimationComponent-motion')) ?? form.motion;
		if (motion === '') {
			getFocus(document.getElementById('setAnimationComponent-motion'));
			return;
		}
		const operation =
			read(document.getElementById('setAnimationComponent-operation')) ?? form.operation;
		switch (operation) {
			case 'set-angle':
				commit({
					actor,
					animationId,
					motion,
					operation,
					angle:
						read(document.getElementById('setAnimationComponent-angle')) ?? form.angle
				});
				break;
			case 'set-scale':
				commit({
					actor,
					animationId,
					motion,
					operation,
					scale:
						read(document.getElementById('setAnimationComponent-scale')) ?? form.scale
				});
				break;
			case 'set-speed':
				commit({
					actor,
					animationId,
					motion,
					operation,
					speed:
						read(document.getElementById('setAnimationComponent-speed')) ?? form.speed
				});
				break;
			case 'set-opacity':
				commit({
					actor,
					animationId,
					motion,
					operation,
					opacity:
						read(document.getElementById('setAnimationComponent-opacity')) ??
						form.opacity
				});
				break;
			case 'set-priority':
				commit({
					actor,
					animationId,
					motion,
					operation,
					priority:
						read(document.getElementById('setAnimationComponent-priority')) ??
						form.priority
				});
				break;
			case 'set-offsetY':
				commit({
					actor,
					animationId,
					motion,
					operation,
					offsetY:
						read(document.getElementById('setAnimationComponent-offsetY')) ??
						form.offsetY
				});
				break;
			case 'set-sprite': {
				const spriteId =
					read(document.getElementById('setAnimationComponent-spriteId')) ??
					form.spriteId;
				if (spriteId === '') {
					getFocus(document.getElementById('setAnimationComponent-spriteId'));
					return;
				}
				commit({
					actor,
					animationId,
					motion,
					operation,
					spriteId,
					image:
						read(document.getElementById('setAnimationComponent-image')) ?? form.image
				});
				break;
			}
			case 'play-motion': {
				const playMotion =
					read(document.getElementById('setAnimationComponent-playMotion')) ??
					form.playMotion;
				if (playMotion === '') {
					getFocus(document.getElementById('setAnimationComponent-playMotion'));
					return;
				}
				commit({
					actor,
					animationId,
					motion,
					operation,
					playMotion,
					wait: read(document.getElementById('setAnimationComponent-wait')) ?? form.wait
				});
				break;
			}
			case 'stop-motion':
				commit({ actor, animationId, motion, operation });
				break;
		}
	};
	Command.cases.setAnimationComponent.customLoad = onLoad;
	Command.cases.setAnimationComponent.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
