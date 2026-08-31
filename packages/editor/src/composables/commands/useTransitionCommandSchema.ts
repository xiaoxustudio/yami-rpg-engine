/* oxlint-disable eslint/no-restricted-properties */
import { clear, getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commit } from '@app/composables/useCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { reactive } from 'vue';

Command.cases.transition = new CommandSchema({
	name: 'transition',
	customParse({
		variable,
		start,
		end,
		easingId,
		duration,
		commands
	}: {
		variable: unknown;
		start: unknown;
		end: unknown;
		easingId: unknown;
		duration: unknown;
		commands: unknown;
	}) {
		const varName = Command.parseVariable!(variable, 'number', true);
		const from = Command.parseVariableNumber!(start);
		const to = Command.parseVariableNumber!(end);
		const easing = Command.parseEasing!(easingId, duration);
		const expression = varName + Token(' = ') + from + Token(' -> ') + to;
		const words = Command.words.push(expression).push(easing);
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.transition') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.transition.end') }
		];
	}
});

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
	commands = children as unknown[];
	getFocus(document.getElementById('transition-variable'));
};

const save = (): unknown => {
	const variable = form.variable as { type: string; key: string };
	if (VariableGetter.isNone!(variable)) {
		return getFocus(document.getElementById('transition-variable'));
	}
	const duration = form.duration as number;
	if (duration === 0) {
		return getFocus(document.getElementById('transition-duration'), 'all');
	}
	commit({
		variable,
		start: form.start,
		end: form.end,
		easingId: form.easingId,
		duration,
		commands
	});
};

const windowClosed = (_event: Event): void => {
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
	return { form, load, save, open, windowClosed };
}
