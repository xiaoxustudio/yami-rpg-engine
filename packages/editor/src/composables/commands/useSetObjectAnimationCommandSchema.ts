import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type ObjectRef = {
	type: string;
	[k: string]: unknown;
};

Command.cases.setObjectAnimation = new CommandSchema({
	name: 'setObjectAnimation',
	fields: [
		{ key: 'sort', default: 'actor' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'animation', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-tint' },
		{ key: 'tint-0', default: 0 },
		{ key: 'tint-1', default: 0 },
		{ key: 'tint-2', default: 0 },
		{ key: 'tint-3', default: 0 },
		{ key: 'opacity', default: 1 },
		{ key: 'offsetY', default: 0 },
		{ key: 'rotation', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	parseTint(operation: string, [red, green, blue, gray]: number[]) {
		const label = t('command.setObjectAnimation.' + operation);
		const _red = Command.setNumberColor!(red);
		const _green = Command.setNumberColor!(green);
		const _blue = Command.setNumberColor!(blue);
		const _gray = Command.setNumberColor!(gray);
		switch (operation) {
			case 'set-tint':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				);
			case 'set-rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				);
			case 'set-gray':
				return label + Token('(') + _gray + Token(')');
		}
	},
	parseProperty(operation: string, property: string | number) {
		const label = t('command.setObjectAnimation.' + operation);
		return label + Token('(') + Command.parseVariableNumber!(property) + Token(')');
	},
	customParse({
		sort,
		object,
		operation,
		tint,
		opacity,
		offsetY,
		rotation,
		easingId,
		duration,
		wait
	}: {
		sort: string;
		object: { type: string; [k: string]: unknown };
		operation: string;
		tint: number[];
		opacity: string | number;
		offsetY: string | number;
		rotation: string | number;
		easingId: string;
		duration: string | number;
		wait: boolean;
	}) {
		const words = Command.words;
		words.push(t('command.setObjectAnimation.sort.' + sort));
		switch (sort) {
			case 'actor':
			case 'components':
				words.push(Command.parseActor!(object));
				break;
			case 'trigger':
				words.push(Command.parseTrigger!(object));
				break;
			case 'animation':
				words.push(Command.parseObject!(object));
				break;
		}
		switch (operation) {
			case 'set-tint':
			case 'set-rgb':
			case 'set-gray':
				words.push(this.parseTint!(operation, tint));
				break;
			case 'set-opacity':
				words.push(this.parseProperty!(operation, opacity));
				break;
			case 'set-offsetY':
				words.push(this.parseProperty!(operation, offsetY));
				break;
			case 'set-rotation':
				words.push(this.parseProperty!(operation, rotation));
				break;
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'object' },
			{ text: t('command.setObjectAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetObjectAnimationCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('setObjectAnimation', {
		onLoad() {
			getFocus(document.getElementById('setObjectAnimation-sort'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const sort = (params.sort ?? 'actor') as string;
		const object = (params.object ?? { type: 'trigger' }) as ObjectRef;
		const tint = (params.tint ?? [0, 0, 0, 0]) as number[];
		const isActor = sort === 'actor' || sort === 'components';
		load({
			...params,
			sort,
			actor: isActor ? object : { type: 'trigger' },
			trigger: sort === 'trigger' ? object : { type: 'trigger' },
			animation: sort === 'animation' ? object : { type: 'trigger' },
			'tint-0': tint[0],
			'tint-1': tint[1],
			'tint-2': tint[2],
			'tint-3': tint[3]
		});
	};
	const onSave = (): void => {
		const sort = read(document.getElementById('setObjectAnimation-sort')) ?? form.sort;
		const operation =
			read(document.getElementById('setObjectAnimation-operation')) ?? form.operation;
		let object: ObjectRef;
		switch (sort) {
			case 'actor':
			case 'components':
				object =
					read(document.getElementById('setObjectAnimation-actor')) ??
					(form.actor as ObjectRef);
				break;
			case 'trigger':
				object =
					read(document.getElementById('setObjectAnimation-trigger')) ??
					(form.trigger as ObjectRef);
				break;
			case 'animation':
				object =
					read(document.getElementById('setObjectAnimation-animation')) ??
					(form.animation as ObjectRef);
				break;
			default:
				return;
		}
		let red = read(document.getElementById('setObjectAnimation-tint-0')) ?? form['tint-0'];
		let green = read(document.getElementById('setObjectAnimation-tint-1')) ?? form['tint-1'];
		let blue = read(document.getElementById('setObjectAnimation-tint-2')) ?? form['tint-2'];
		let gray = read(document.getElementById('setObjectAnimation-tint-3')) ?? form['tint-3'];
		switch (operation) {
			case 'set-tint':
				break;
			case 'set-rgb':
				gray = 0;
				break;
			case 'set-gray':
				red = 0;
				green = 0;
				blue = 0;
				break;
		}
		const easingId =
			read(document.getElementById('setObjectAnimation-easingId')) ?? form.easingId;
		const duration =
			read(document.getElementById('setObjectAnimation-duration')) ?? form.duration;
		const wait = read(document.getElementById('setObjectAnimation-wait')) ?? form.wait;
		if ('set-tint|set-rgb|set-gray'.includes(operation as string)) {
			commit({
				sort,
				object,
				operation,
				tint: [red, green, blue, gray],
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-opacity') {
			commit({
				sort,
				object,
				operation,
				opacity:
					read(document.getElementById('setObjectAnimation-opacity')) ?? form.opacity,
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-offsetY') {
			commit({
				sort,
				object,
				operation,
				offsetY:
					read(document.getElementById('setObjectAnimation-offsetY')) ?? form.offsetY,
				easingId,
				duration,
				wait
			});
		} else if (operation === 'set-rotation') {
			commit({
				sort,
				object,
				operation,
				rotation:
					read(document.getElementById('setObjectAnimation-rotation')) ?? form.rotation,
				easingId,
				duration,
				wait
			});
		}
	};
	Command.cases.setObjectAnimation.customLoad = onLoad;
	Command.cases.setObjectAnimation.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
