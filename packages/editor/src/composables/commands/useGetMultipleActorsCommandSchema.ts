import '@app/legacy/module/command/getMultipleActors.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGetMultipleActorsCommandSchema() {
	const { form, save, load } = useCommandSchema('getMultipleActors', {
		onLoad() {
			getFocus(document.getElementById('getMultipleActors-variable')!);
		}
	});
	const onSave = (): void => {
		const variable =
			read(document.getElementById('getMultipleActors-variable')!) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('getMultipleActors-variable')!);
			return;
		}
		const position =
			read(document.getElementById('getMultipleActors-position')!) ?? form.position;
		const area = (read(document.getElementById('getMultipleActors-area')!) ??
			form.area) as string;
		const selector = (read(document.getElementById('getMultipleActors-selector')!) ??
			form.selector) as string;
		const activation =
			read(document.getElementById('getMultipleActors-activation')!) ?? form.activation;
		let params1: Record<string, unknown>;
		switch (area) {
			case 'rectangle':
				params1 = {
					variable,
					position,
					area,
					width: read(document.getElementById('getMultipleActors-width')!) ?? form.width,
					height:
						read(document.getElementById('getMultipleActors-height')!) ?? form.height
				};
				break;
			default:
				params1 = {
					variable,
					position,
					area,
					radius:
						read(document.getElementById('getMultipleActors-radius')!) ?? form.radius
				};
				break;
		}
		let params2: Record<string, unknown>;
		switch (selector) {
			case 'enemy':
			case 'friend':
			case 'team':
				params2 = {
					selector,
					teamId:
						read(document.getElementById('getMultipleActors-teamId')!) ?? form.teamId
				};
				break;
			default:
				params2 = { selector };
				break;
		}
		Command.save?.({ ...params1, ...params2, activation });
	};
	Command.cases.getMultipleActors.customSave = onSave;
	return { form, save: onSave, load };
}
