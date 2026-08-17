import '@app/legacy/module/command/setSkill.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetSkillCommandSchema() {
	const { form, save, load } = useCommandSchema('setSkill', {
		onLoad() {
			getFocus($('#setSkill-skill'));
		}
	});
	const onSave = (): void => {
		const skill = read($('#setSkill-skill')) ?? form.skill;
		const operation = read($('#setSkill-operation')) ?? form.operation;
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				Command.save!({
					skill,
					operation,
					cooldown: read($('#setSkill-cooldown')) ?? form.cooldown
				});
				break;
			}
		}
	};
	Command.cases.setSkill.customSave = onSave;
	return { form, save: onSave, load };
}
