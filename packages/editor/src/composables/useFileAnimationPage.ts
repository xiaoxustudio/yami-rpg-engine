import '@app/legacy/inspector/file-animation-page.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';

export function useFileAnimationPage() {
	const sync = (): void => {
		const editor = Inspector?.fileAnimation;
		const target = editor?.target as { sprites?: unknown[] } | null | undefined;
		if (!target) return;
		const el = document.getElementById('fileAnimation-sprites') as
			| (HTMLElement & { write?: (data: unknown[]) => void })
			| null;
		if (el) {
			el.write?.(target.sprites ?? []);
		}
	};

	return { sync };
}
