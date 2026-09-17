import { Path } from '@app/utils/config';
import { Editor } from './editor.ts';
import { remove } from '@app/utils/array';

function updatePath(this: typeof Editor, path: string) {
	const { config } = this;

	config!.project = path;

	config!.dialogs!.open = Path.dirname!(path);

	const items = config!.recent!;
	const date = Date.now();
	const item = items.find((a: { path: string }) => a.path === path);
	if (item) {
		item.date = date;
		remove(items, item);
		items.unshift(item);
	} else {
		items.unshift({ path, date });
		while (items.length > 3) {
			items.pop();
		}
	}
}

export function initProjectPath(): void {
	Editor.updatePath = updatePath;
}
