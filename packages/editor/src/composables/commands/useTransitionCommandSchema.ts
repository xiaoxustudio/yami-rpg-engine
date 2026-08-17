import '@app/legacy/module/command/transition.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { clear, getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});
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
	form.variable = variable;
	form.start = start;
	form.end = end;
	form.easingId = easingId;
	form.duration = duration;
	write($('#transition-variable'), form.variable);
	write($('#transition-start'), form.start);
	write($('#transition-end'), form.end);
	write($('#transition-easingId'), form.easingId);
	write($('#transition-duration'), form.duration);
	commands = children as unknown[];
	getFocus($('#transition-variable'));
};

const save = (): unknown => {
	const variable = read($('#transition-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable as any)) {
		return getFocus($('#transition-variable'));
	}
	const duration = (read($('#transition-duration')) ?? form.duration) as number;
	if (duration === 0) {
		return getFocus($('#transition-duration'), 'all');
	}
	Command.save?.({
		variable,
		start: read($('#transition-start')) ?? form.start,
		end: read($('#transition-end')) ?? form.end,
		easingId: read($('#transition-easingId')) ?? form.easingId,
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
