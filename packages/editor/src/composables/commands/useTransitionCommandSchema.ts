import '@/module/command/transition.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Data } from '@/data/data-object.ts';

let commands: unknown[] | null = null;

const load = ({
	variable = { type: 'local', key: '' },
	start = 0,
	end = 1,
	easingId = Data.easings[0].id,
	duration = 1000,
	commands: children = []
}: {
	variable?: unknown;
	start?: unknown;
	end?: unknown;
	easingId?: unknown;
	duration?: unknown;
	commands?: unknown;
} = {}): void => {
	const write = getElementWriter('transition');
	write('variable', variable);
	write('start', start);
	write('end', end);
	write('easingId', easingId);
	write('duration', duration);
	commands = children as unknown[];
	getFocus($('#transition-variable'));
};

const save = (): unknown => {
	const read = getElementReader('transition');
	const variable = read('variable');
	if (VariableGetter.isNone!(variable)) {
		return getFocus($('#transition-variable'));
	}
	const duration = read('duration');
	if (duration === 0) {
		return getFocus($('#transition-duration'), 'all');
	}
	Command.save?.({
		variable,
		start: read('start'),
		end: read('end'),
		easingId: read('easingId'),
		duration,
		commands
	});
};

const windowClosed = (event: Event): void => {
	commands = null;
	clear($('#transition-easingId'));
};

const open = (): void => {
	$('#transition-easingId')?.loadItems?.(Data.createEasingItems!());
};

const schema = Command.cases.transition;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useTransitionCommandSchema() {
	return { load, save, open, windowClosed };
}
