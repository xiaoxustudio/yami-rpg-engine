import '@app/legacy/module/command/transition.ts';
import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
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
	write(document.getElementById('transition-variable'), form.variable);
	write(document.getElementById('transition-start'), form.start);
	write(document.getElementById('transition-end'), form.end);
	write(document.getElementById('transition-easingId'), form.easingId);
	write(document.getElementById('transition-duration'), form.duration);
	commands = children as unknown[];
	getFocus(document.getElementById('transition-variable'));
};

const save = (): unknown => {
	const variable = read(document.getElementById('transition-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable)) {
		return getFocus(document.getElementById('transition-variable'));
	}
	const duration = (read(document.getElementById('transition-duration')) ??
		form.duration) as number;
	if (duration === 0) {
		return getFocus(document.getElementById('transition-duration'), 'all');
	}
	commit({
		variable,
		start: read(document.getElementById('transition-start')) ?? form.start,
		end: read(document.getElementById('transition-end')) ?? form.end,
		easingId: read(document.getElementById('transition-easingId')) ?? form.easingId,
		duration,
		commands
	});
};

const windowClosed = (event: Event): void => {
	commands = null;
	clear(document.getElementById('transition-easingId'));
};

const open = (): void => {
	document.getElementById('transition-easingId')?.loadItems?.(Data.createEasingItems!());
};

const schema = Command.cases.transition;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useTransitionCommandSchema() {
	return { load, save, open, windowClosed };
}
