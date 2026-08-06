import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.webSocketClose = new CommandSchema({
	name: 'webSocketClose',
	onInitialize() {
		write($('#webSocketClose-id'), '');
		write($('#webSocketClose-code'), '');
		write($('#webSocketClose-reason'), '');
		$('#webSocketClose-confirm').on('click', () => this.save!());
	},
	customParse({ id = '', code = '', reason = '' }) {
		const head = [
			{ color: 'network' },
			{ text: Local.get!('command.webSocketClose') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id }
		];
		if (code !== '' && code !== null && code !== undefined) {
			head.push({ text: ' , ' }, { text: String(code) });
		}
		if (reason) {
			head.push({ text: ' , ' }, { text: reason });
		}
		return head;
	},
	customLoad({ id = '', code = '', reason = '' }) {
		write($('#webSocketClose-id'), id);
		write($('#webSocketClose-code'), code ?? '');
		write($('#webSocketClose-reason'), reason);
		getFocus($('#webSocketClose-id'));
	},
	customSave() {
		const elId = $('#webSocketClose-id');
		const id = read(elId);
		if (!id || VariableGetter.isNone!(id)) {
			return getFocus(elId);
		}
		const reader = getElementReader('webSocketClose');
		const code = reader('code');
		Command.save!({
			id: id,
			code: code === '' ? '' : Number(code),
			reason: reader('reason')
		});
	}
});
