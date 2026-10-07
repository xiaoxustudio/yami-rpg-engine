export interface BootMark {
	/** 阶段名，例如 `vue-mounted` */
	name: string;
	/** 相对导航开始的毫秒数 */
	ms: number;
}

const marks: BootMark[] = (() => {
	if (typeof window === 'undefined') return [];
	return window.__BOOT_MARKS__ ?? [];
})();

export function markBoot(name: string): void {
	if (typeof performance === 'undefined') return;
	marks.push({ name, ms: performance.now() });
}

export function reportBootTimeline(): void {
	if (marks.length === 0) return;
	let last = 0;
	const parts = marks.map((mark) => {
		const delta = mark.ms - last;
		last = mark.ms;
		return `${mark.name}=${mark.ms.toFixed(1)}(+${delta.toFixed(1)})`;
	});
	console.warn(`[boot] ${parts.join(' ')}`);
}
