import '@/module/command/changeActorSkill.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorSkillCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorSkill', {
		onLoad() {
			getFocus($('#changeActorSkill-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#changeActorSkill-actor')) ?? form.actor;
		const operation = read($('#changeActorSkill-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId = read($('#changeActorSkill-skillId')) ?? form.skillId;
				if (skillId === '') {
					getFocus($('#changeActorSkill-skillId'));
					return;
				}
				Command.save?.({ actor, operation, skillId });
				break;
			}
			case 'remove-instance':
				Command.save?.({
					actor,
					operation,
					skill: read($('#changeActorSkill-skill')) ?? form.skill
				});
				break;
			case 'sort-by-order':
				Command.save?.({ actor, operation });
				break;
		}
	};
	Command.cases.changeActorSkill.customSave = onSave;
	return { form, save: onSave, load };
}
