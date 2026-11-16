import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';
import { readPayload } from '../../../../utils/payload-event';

type BodyApi = InstanceType<typeof YMFileBodyPane>;

class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	children: FileItem[] = [];
	parent?: FileItem;
	data?: Record<string, unknown>;
	meta?: { guid: string };
	stats?: { ino: number };
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string, extname = '') {
		this.path = path;
		this.name = name;
		this.basename = name;
		this.extname = extname;
		this.type = 'event';
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

class FolderItem {
	path: string;
	name: string;
	children: FileItem[] = [];
	parent?: FolderItem;
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

const makeLinks = () => ({
	browser: { display: 'normal', filters: null, backToParentFolder: vi.fn() },
	nav: { getSelections: () => [], load: vi.fn(), scrollToSelection: vi.fn() },
	body: null
});

const mountPane = () => {
	const wrapper = mount(YMFileBodyPane, {
		props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
	});
	return { wrapper, vm: wrapper.vm as BodyApi };
};

describe('YMFileBodyPane', () => {
	it('mounts and exposes api through the component instance', () => {
		const { wrapper, vm } = mountPane();
		expect(wrapper.element.classList.contains('file-body-pane')).toBe(true);
		expect(wrapper.element.querySelector('.file-body-content')).toBeTruthy();
		expect(typeof vm.select).toBe('function');
		expect(typeof vm.unselect).toBe('function');
		expect(typeof vm.selectByPath).toBe('function');
		expect(typeof vm.clear).toBe('function');
		expect(typeof vm.on).toBe('function');
	});

	it('select adds selected class to context element', () => {
		const { vm } = mountPane();
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		vm.select(file as never);
		expect(vm.getSelections()).toEqual([file]);
		expect(item.classList.contains('selected')).toBe(true);
	});

	it('unselect removes selected class', () => {
		const { vm } = mountPane();
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		vm.select(file as never);
		vm.unselect();
		expect(vm.getSelections()).toEqual([]);
		expect(item.classList.contains('selected')).toBe(false);
	});

	it('on enables select event dispatch', () => {
		const { vm } = mountPane();
		let value: unknown;
		vm.on('select', (e: Event) => (value = readPayload<{ value?: unknown }>(e).value));
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		vm.select(file as never);
		expect(value).toEqual([file]);
	});
});
