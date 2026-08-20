import '@app/legacy/module/command/followActor.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useFollowActorCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('followActor', {
		onLoad() {
			getFocus(document.getElementById('followActor-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('followActor-actor')) ?? form.actor;
		const target = read(document.getElementById('followActor-target')) ?? form.target;
		const mode = read(document.getElementById('followActor-mode')) ?? form.mode;
		const minDist = read(document.getElementById('followActor-minDist')) ?? form.minDist;
		const maxDist = read(document.getElementById('followActor-maxDist')) ?? form.maxDist;
		const bufferDist =
			read(document.getElementById('followActor-bufferDist')) ?? form.bufferDist;
		const navigate = read(document.getElementById('followActor-navigate')) ?? form.navigate;
		const bypass = navigate
			? { bypass: read(document.getElementById('followActor-bypass')) ?? form.bypass }
			: {};
		const once = read(document.getElementById('followActor-once')) ?? form.once;
		const wait = once
			? (read(document.getElementById('followActor-wait')) ?? form.wait)
			: false;
		switch (mode) {
			case 'circle':
				commit({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset: read(document.getElementById('followActor-offset')) ?? form.offset,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				});
				break;
			case 'rectangle':
				commit({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist:
						read(document.getElementById('followActor-vertDist')) ?? form.vertDist,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				});
				break;
		}
	};
	Command.cases.followActor.customSave = onSave;
	return { form, save: onSave, load };
}
