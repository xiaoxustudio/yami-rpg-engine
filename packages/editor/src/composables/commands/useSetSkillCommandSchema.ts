import '@app/legacy/module/command/setSkill.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetSkillCommandSchema() {
	const { form, save, load } = useCommandSchema('setSkill', {
		onLoad() {
			getFocus(document.getElementById('setSkill-skill'));
		}
	});
	const onSave = (): void => {
		const skill = read(document.getElementById('setSkill-skill')) ?? form.skill;
		const operation = read(document.getElementById('setSkill-operation')) ?? form.operation;
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				Command.save!({
					skill,
					operation,
					cooldown: read(document.getElementById('setSkill-cooldown')) ?? form.cooldown
				});
				break;
			}
		}
	};
	Command.cases.setSkill.customSave = onSave;
	return { form, save: onSave, load };
}
