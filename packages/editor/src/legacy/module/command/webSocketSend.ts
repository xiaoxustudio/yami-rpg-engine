import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.webSocketSend = new CommandSchema({
	name: 'webSocketSend',
	onInitialize() {
		write($('#webSocketSend-id'), '');
		write($('#webSocketSend-data'), '');
		$('#webSocketSend-confirm').on('click', () => this.save!());
	},
	customParse({ id = '', data = '' }) {
		return [
			{ color: 'network' },
			{ text: Local.get!('command.webSocketSend') },
			{ text: ' , ' },
			{ color: 'normal' },
			{ text: id },
			{ text: ' , ' },
			{
				text:
					typeof data === 'string'
						? data.length > 20
							? data.substring(0, 20) + '...'
							: data
						: Command.parseVariable!(data, 'any')
			}
		];
	},
	customLoad({ id = '', data = '' }) {
		write($('#webSocketSend-id'), id);
		write($('#webSocketSend-data'), data);
		getFocus($('#webSocketSend-id'));
	},
	customSave() {
		const elId = $('#webSocketSend-id');
		const id = read(elId);
		if (!id || VariableGetter.isNone!(id)) {
			return getFocus(elId);
		}
		const elData = $('#webSocketSend-data');
		const data = read(elData);
		if (!data || VariableGetter.isNone!(data)) {
			return getFocus(elData);
		}
		const reader = getElementReader('webSocketSend');
		Command.save!({
			id: id,
			data: data
		});
	}
});
