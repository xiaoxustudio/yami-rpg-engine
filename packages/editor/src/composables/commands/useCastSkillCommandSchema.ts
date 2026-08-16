import '@/module/command/castSkill.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCastSkillCommandSchema() {
	const { form, save, load } = useCommandSchema('castSkill', {
		onLoad() {
			$('#castSkill-key')?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus($('#castSkill-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#castSkill-actor')) ?? form.actor;
		const mode = read($('#castSkill-mode')) ?? form.mode;
		const wait = read($('#castSkill-wait')) ?? form.wait;
		switch (mode) {
			case 'by-key': {
				const key = read($('#castSkill-key')) ?? form.key;
				if (key === '') {
					getFocus($('#castSkill-key'));
					return;
				}
				Command.save?.({ actor, mode, key, wait });
				break;
			}
			case 'by-id': {
				const skillId = read($('#castSkill-skillId')) ?? form.skillId;
				if (skillId === '') {
					getFocus($('#castSkill-skillId'));
					return;
				}
				Command.save?.({ actor, mode, skillId, wait });
				break;
			}
			case 'by-skill':
				Command.save?.({
					actor,
					mode,
					skill: read($('#castSkill-skill')) ?? form.skill,
					wait
				});
				break;
			case 'by-variable':
				Command.save?.({
					actor,
					mode,
					keyVar: read($('#castSkill-keyVar')) ?? form.keyVar,
					wait
				});
				break;
		}
	};
	Command.cases.castSkill.customSave = onSave;
	return { form, save: onSave, load };
}
