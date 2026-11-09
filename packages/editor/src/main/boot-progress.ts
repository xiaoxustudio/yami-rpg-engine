import { windowProgressNodes } from '@app/composables/page-shell-nodes';
import { getWindowProgress } from '@app/composables/title-window-bridges';

export function showBootProgress(label: string, current?: number, total?: number): void {
	// 进度窗口可能还没挂载（启动早期）：桥取不到时跳过文案
	getWindowProgress()?.setInfo(
		current !== undefined && total !== undefined && total > 0
			? `${label} ${current}/${total}`
			: label
	);
	const bar = windowProgressNodes.pick('bar');
	if (!bar) return;
	if (current !== undefined && total !== undefined && total > 0) {
		bar.style.width = `${Math.round((current / total) * 100)}%`;
	} else {
		bar.style.width = '100%';
	}
}
