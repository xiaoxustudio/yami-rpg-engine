import '@app/legacy/module/command/comment.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCommentCommandSchema() {
	return useCommandSchema('comment', {
		onLoad() {
			getFocus($('#comment-comment'), 'end');
		}
	});
}
