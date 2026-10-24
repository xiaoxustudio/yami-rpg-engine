import { titleEls } from '@app/title/element-registry';

export function showBootProgress(label: string, current?: number, total?: number): void {
	const info = titleEls.get('windowProgress-info') as HTMLElement | null;
	if (info) {
		info.textContent =
			current !== undefined && total !== undefined && total > 0
				? `${label} ${current}/${total}`
				: label;
	}
	const bar = titleEls.get('windowProgress-bar') as HTMLElement | null;
	if (!bar) return;
	if (current !== undefined && total !== undefined && total > 0) {
		bar.style.width = `${Math.round((current / total) * 100)}%`;
	} else {
		bar.style.width = '100%';
	}
}
