import '@/module/command/comment.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCommentCommandSchema() {
	return useCommandSchema('comment', {
		onLoad() {
			getFocus($('#comment-comment'), 'end');
		}
	});
}
