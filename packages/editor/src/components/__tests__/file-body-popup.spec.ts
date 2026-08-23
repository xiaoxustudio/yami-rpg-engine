import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { YMFileBodyPane } from '@ui-kit';

interface FileBodyItemApi extends HTMLElement {
	file: { name: string; meta?: { guid: string }; path: string };
}

function makeLinks() {
	const body = {
		content: document.createElement('div'),
		on: vi.fn(),
		updateFiles: vi.fn(),
		selections: [],
		select: vi.fn()
	};
	const node = document.createElement('div');
	node.id = 'project-browser';
	node.classList.add('file-browser');
	const nav = document.createElement('div') as HTMLDivElement & { selections: unknown[] };
	nav.selections = [];
	node.append(nav, body.content);
	return { links: { browser: node, nav, head: null, body }, body };
}

function mountPane() {
	const { links, body } = makeLinks();
	const wrapper = mount(YMFileBodyPane, {
		props: {
			links,
			directoryApi: {},
			fileSystemApi: {},
			pathUtil: { dirname: (p: string) => p.split('/').slice(0, -1).join('/') },
			fileClasses: { FileItem: class FileItem {}, FolderItem: class FolderItem {} },
			createTextBox: () => null,
			setIconClip: () => {},
			menuState: () => 'closed'
		},
		attachTo: document.body
	});
	return { wrapper, body, links };
}

function appendItem(content: HTMLElement): FileBodyItemApi {
	const item = document.createElement('div') as unknown as FileBodyItemApi;
	item.classList.add('file-body-item');
	item.classList.add('selected');
	item.file = { name: 'a.png', path: 'a.png' };
	content.appendChild(item);
	return item;
}

describe('文件浏览器右键菜单触发（popup 事件回归保护）', () => {
	it('直接右键项目（无预聚焦）触发 popup（pointerdown 自动聚焦 content）', async () => {
		const { wrapper } = mountPane();
		await wrapper.vm.$nextTick();
		const el = wrapper.element as HTMLElement;
		const content = el.querySelector('.file-body-content') as HTMLElement;
		const item = appendItem(content);
		const listener = vi.fn();
		(el as unknown as { on(type: string, l: () => void): void }).on('popup', listener);
		item.dispatchEvent(new PointerEvent('pointerdown', { button: 2, bubbles: true }));
		item.dispatchEvent(new PointerEvent('pointerup', { button: 2, bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(listener).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it('已聚焦 content 时右键项目触发 popup', async () => {
		const { wrapper } = mountPane();
		await wrapper.vm.$nextTick();
		const el = wrapper.element as HTMLElement;
		const content = el.querySelector('.file-body-content') as HTMLElement;
		content.focus();
		const item = appendItem(content);
		const listener = vi.fn();
		(el as unknown as { on(type: string, l: () => void): void }).on('popup', listener);
		item.dispatchEvent(new PointerEvent('pointerdown', { button: 2, bubbles: true }));
		item.dispatchEvent(new PointerEvent('pointerup', { button: 2, bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(listener).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});
});
