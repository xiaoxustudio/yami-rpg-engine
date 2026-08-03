import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from './schema.ts';

Command.cases.comment = new CommandSchema({
	name: 'comment',
	fields: [{ key: 'comment', domId: 'comment', default: '', required: true }],
	customParse({ comment }: any) {
		const lines = comment.split('\n');
		const contents = [];
		for (const line of lines) {
			if (contents.length === 0) {
				contents.push({ color: 'comment' }, { text: line });
			} else {
				contents.push({ break: true }, { text: line });
			}
		}
		if (lines.length > 1) {
			contents.unshift({ fold: true });
		}
		return contents;
	},
	onLoad() {
		getFocus($('#comment-comment'), 'end');
	}
});
