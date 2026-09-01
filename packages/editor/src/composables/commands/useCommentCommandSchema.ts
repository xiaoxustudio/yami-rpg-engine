/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { requestFocus } from '@app/directives/focus';

Command.cases.comment = new CommandSchema({
	name: 'comment',
	fields: [{ key: 'comment', domId: 'comment', default: '', required: true }],
	customParse({ comment }: { comment: string }) {
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
	}
});

export function useCommentCommandSchema() {
	return useCommandSchema('comment', {
		skipWrite: true,
		onLoad() {
			requestFocus('comment-comment', 'end');
		}
	});
}
