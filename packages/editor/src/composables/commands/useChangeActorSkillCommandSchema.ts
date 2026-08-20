import '@app/legacy/module/command/changeActorSkill.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorSkillCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('changeActorSkill', {
		onLoad() {
			getFocus(document.getElementById('changeActorSkill-actor')!);
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('changeActorSkill-actor')!) ?? form.actor;
		const operation =
			read(document.getElementById('changeActorSkill-operation')!) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId =
					read(document.getElementById('changeActorSkill-skillId')!) ?? form.skillId;
				if (skillId === '') {
					getFocus(document.getElementById('changeActorSkill-skillId')!);
					return;
				}
				commit({ actor, operation, skillId });
				break;
			}
			case 'remove-instance':
				commit({
					actor,
					operation,
					skill: read(document.getElementById('changeActorSkill-skill')!) ?? form.skill
				});
				break;
			case 'sort-by-order':
				commit({ actor, operation });
				break;
		}
	};
	Command.cases.changeActorSkill.customSave = onSave;
	return { form, save: onSave, load };
}
