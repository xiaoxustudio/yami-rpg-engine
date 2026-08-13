import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FileBrowser from '@app/components/file-browser/FileBrowser.vue';
import { getBrowserStore } from '@app/stores/browser';

vi.mock('electron', () => ({
	ipcRenderer: {
		sendSync: () => false,
		invoke: () => Promise.resolve('')
	}
}));

interface FileBrowserNode extends HTMLElement {
	body?: HTMLElement & { on?: (...a: unknown[]) => void; selections?: unknown[] };
}

function appendItem(content: HTMLElement): HTMLElement & { file: { name: string; path: string } } {
	const item = document.createElement('file-body-item') as HTMLElement & {
		file: { name: string; path: string };
	};
	item.classList.add('selected');
	item.file = { name: 'a.png', path: 'a.png' };
	content.appendChild(item);
	return item;
}

describe('FileBrowser 初始化事件注册（时序回归保护）', () => {
	it('挂载后右键项目派发 popup 事件（initialize 重试机制修复时序竞态）', async () => {
		document.body.innerHTML = '';
		const container = document.createElement('div');
		container.id = 'project-browser';
		container.className = 'file-browser';
		document.body.appendChild(container);
		const page = document.createElement('div');
		page.id = 'project';
		document.body.appendChild(page);
		const wrapper = mount(FileBrowser, {
			props: { id: 'project-browser' },
			attachTo: container
		});
		await new Promise((resolve) => setTimeout(resolve, 600));
		const Browser = getBrowserStore().getBrowser() as unknown as FileBrowserNode | null;
		const body = Browser?.body;
		expect(body).toBeTruthy();
		const content = body!.querySelector('.file-body-content') as HTMLElement;
		const item = appendItem(content);
		const listener = vi.fn();
		body!.addEventListener('popup', listener);
		item.dispatchEvent(new PointerEvent('pointerdown', { button: 2, bubbles: true }));
		item.dispatchEvent(new PointerEvent('pointerup', { button: 2, bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(listener).toHaveBeenCalled();
		wrapper.unmount();
		container.remove();
		page.remove();
	});
});
