import '@app/legacy/module/command/followActor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useFollowActorCommandSchema() {
	const { form, save, load } = useCommandSchema('followActor', {
		onLoad() {
			getFocus($('#followActor-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#followActor-actor')) ?? form.actor;
		const target = read($('#followActor-target')) ?? form.target;
		const mode = read($('#followActor-mode')) ?? form.mode;
		const minDist = read($('#followActor-minDist')) ?? form.minDist;
		const maxDist = read($('#followActor-maxDist')) ?? form.maxDist;
		const bufferDist = read($('#followActor-bufferDist')) ?? form.bufferDist;
		const navigate = read($('#followActor-navigate')) ?? form.navigate;
		const bypass = navigate ? { bypass: read($('#followActor-bypass')) ?? form.bypass } : {};
		const once = read($('#followActor-once')) ?? form.once;
		const wait = once ? (read($('#followActor-wait')) ?? form.wait) : false;
		switch (mode) {
			case 'circle':
				Command.save?.({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset: read($('#followActor-offset')) ?? form.offset,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				});
				break;
			case 'rectangle':
				Command.save?.({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist: read($('#followActor-vertDist')) ?? form.vertDist,
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
