import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import UploadFile from '@app/components/commands/UploadFile.vue';
import { useUploadFileCommandSchema } from '@app/composables/commands/useUploadFileCommandSchema';
import UseItem from '@app/components/commands/UseItem.vue';
import Wait from '@app/components/commands/Wait.vue';
import { useWaitCommandSchema } from '@app/composables/commands/useWaitCommandSchema';
import WaitForVideo from '@app/components/commands/WaitForVideo.vue';
import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
import WebSocketClose from '@app/components/commands/WebSocketClose.vue';
import { useWebSocketCloseCommandSchema } from '@app/composables/commands/useWebSocketCloseCommandSchema';
import WebSocketConnect from '@app/components/commands/WebSocketConnect.vue';
import { useWebSocketConnectCommandSchema } from '@app/composables/commands/useWebSocketConnectCommandSchema';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useUploadFileCommandSchema（uploadFile 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || variable === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'uploadFile');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('uploadFile');
			expect(getControl('uploadFile-url').read()).toBe('');
			expect(getControl('uploadFile-method').read()).toBe('POST');
			expect(getControl('uploadFile-path').read()).toBe('');
			expect(getControl('uploadFile-field').read()).toBe('file');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'uploadFile',
				params: {
					url: 'http://example.com/up',
					method: 'PUT',
					path: { type: 'local', key: 'path' },
					field: 'f1',
					callback: 'cb1'
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('uploadFile');
			expect(getControl('uploadFile-url').read()).toBe('http://example.com/up');
			expect(getControl('uploadFile-method').read()).toBe('PUT');
			expect(getControl('uploadFile-path').read()).toEqual({ type: 'local', key: 'path' });
			expect(getControl('uploadFile-field').read()).toBe('f1');
			expect(getControl('uploadFile-callback').read()).toBe('cb1');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.uploadFile.save 保存', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useUploadFileCommandSchema();
			Command.cases.uploadFile.customLoad!({
				url: 'http://example.com/up',
				method: 'POST',
				path: 'C:/file'
			});
			form.method = 'PUT';
			form.field = 'f2';
			form.callback = 'cb2';
			form.rateCallback = 'rc2';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.uploadFile.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'http://example.com/up',
				method: 'PUT',
				path: 'C:/file',
				field: 'f2',
				headers: [],
				callback: 'cb2',
				rateCallback: 'rc2'
			});
			wrapper.unmount();
		});

		it('save 路径：url 为 none 校验失败不保存', async () => {
			const wrapper = mount(UploadFile, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.uploadFile.customLoad!({
				url: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.uploadFile.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useUseItemCommandSchema（useItem 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Enum.getStringItems = vi.fn(() => [{ name: 'Key 1', value: 'key1' }]) as never;
			Enum.getDefStringId = vi.fn(() => 'key1') as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 mode/wait 选项', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const mode = document.getElementById('useItem-mode') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(mode.dataItems).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'useItem');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('useItem');
			expect(getControl('useItem-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('useItem-mode').read()).toBe('by-key');
			expect(getControl('useItem-key').read()).toBe('key1');
			expect(getControl('useItem-wait').read()).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'useItem',
				params: {
					actor: { type: 'player' },
					mode: 'by-item',
					item: { type: 'item' },
					wait: true
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('useItem');
			expect(getControl('useItem-actor').read()).toEqual({ type: 'player' });
			expect(getControl('useItem-mode').read()).toBe('by-item');
			expect(getControl('useItem-item').read()).toEqual({ type: 'item' });
			expect(getControl('useItem-wait').read()).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.useItem.save 保存', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.useItem.customLoad!({
				actor: { type: 'trigger' },
				mode: 'by-key',
				key: 'key1',
				wait: false
			});
			getControl('useItem-mode').input('by-id');
			getControl('useItem-itemId').input('item1');
			getControl('useItem-wait').input(true);
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.useItem.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				mode: 'by-id',
				itemId: 'item1',
				wait: true
			});
			wrapper.unmount();
		});

		it('save 路径：by-key 空 key 校验失败不保存', async () => {
			const wrapper = mount(UseItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.useItem.customLoad!({
				actor: { type: 'trigger' },
				mode: 'by-key',
				key: '',
				wait: false
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.useItem.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useWaitCommandSchema（wait 命令表单 composable：form 状态 + insert/edit/save）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（v-model 驱动控件）', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			CommandSchema.insert(target, 'wait');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('wait');
			expect(form.duration).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form（v-model 驱动控件）', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			CommandSchema.edit(target, { id: 'wait', params: { duration: 500 } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('wait');
			expect(form.duration).toBe(500);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.wait.save 保存', async () => {
			const wrapper = mount(Wait, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitCommandSchema();
			Command.cases.wait.customLoad!({ duration: 1 });
			form.duration = 800;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.wait.save!();
			expect(saved).toHaveBeenCalledWith({ duration: 800 });
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useWaitForVideoCommandSchema（waitForVideo 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			CommandSchema.insert(target, 'waitForVideo');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('waitForVideo');
			expect(form.element).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			CommandSchema.edit(target, {
				id: 'waitForVideo',
				params: { element: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('waitForVideo');
			expect(form.element).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.waitForVideo.save 保存', async () => {
			const wrapper = mount(WaitForVideo, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWaitForVideoCommandSchema();
			Command.cases.waitForVideo.customLoad!({ element: { type: 'trigger' } });
			form.element = { type: 'global' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.waitForVideo.save!();
			expect(saved).toHaveBeenCalledWith({ element: { type: 'global' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 element 文本', () => {
			setWords();
			Command.parseElement = vi.fn((e: { type: string }) => `E:${e.type}`) as never;
			const contents = Command.cases.waitForVideo.parse!({ element: { type: 'trigger' } });
			expect(contents).toContainEqual({ text: 'E:trigger' });
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useWebSocketCloseCommandSchema（webSocketClose 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketCloseCommandSchema();
			CommandSchema.insert(target, 'webSocketClose');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketClose');
			expect(form.id).toBe('');
			expect(form.code).toBe('');
			expect(form.reason).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketCloseCommandSchema();
			CommandSchema.edit(target, {
				id: 'webSocketClose',
				params: { id: 'ws1', code: 1000, reason: 'bye' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketClose');
			expect(form.id).toBe('ws1');
			expect(form.code).toBe(1000);
			expect(form.reason).toBe('bye');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.webSocketClose.save 保存', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketCloseCommandSchema();
			Command.cases.webSocketClose.customLoad!({
				id: 'ws1',
				code: 1000,
				reason: 'bye'
			});
			form.code = 4000;
			form.reason = 'closing';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketClose.save!();
			expect(saved).toHaveBeenCalledWith({ id: 'ws1', code: 4000, reason: 'closing' });
			wrapper.unmount();
		});

		it('save 路径：id 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketClose, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketClose.customLoad!({ id: '', code: '', reason: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketClose.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 id/code/reason 文本', () => {
			const contents = Command.cases.webSocketClose.parse!({
				id: 'ws1',
				code: 1000,
				reason: 'bye'
			});
			expect(contents).toContainEqual({ text: 'ws1' });
			expect(contents).toContainEqual({ text: '1000' });
			expect(contents).toContainEqual({ text: 'bye' });
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useWebSocketConnectCommandSchema（webSocketConnect 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketConnectCommandSchema();
			CommandSchema.insert(target, 'webSocketConnect');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
			expect(form.url).toBe('');
			expect(form.id).toBe('');
			expect(form.protocols).toBe('');
			expect(form.onOpen).toBe('');
			expect(form.onMessage).toBe('');
			expect(form.onError).toBe('');
			expect(form.onClose).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketConnectCommandSchema();
			CommandSchema.edit(target, {
				id: 'webSocketConnect',
				params: { url: 'wss://host/socket', id: 'ws1', protocols: 'graphql-ws' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
			expect(form.url).toBe('wss://host/socket');
			expect(form.id).toBe('ws1');
			expect(form.protocols).toBe('graphql-ws');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.webSocketConnect.save 保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useWebSocketConnectCommandSchema();
			Command.cases.webSocketConnect.customLoad!({
				url: 'wss://host/socket',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			form.protocols = 'graphql-ws';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).toHaveBeenCalledWith({
				url: 'wss://host/socket',
				id: 'ws1',
				protocols: 'graphql-ws',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			wrapper.unmount();
		});

		it('save 路径：url 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketConnect.customLoad!({
				url: '',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：id 为空校验失败不保存', async () => {
			const wrapper = mount(WebSocketConnect, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketConnect.customLoad!({
				url: 'wss://host/socket',
				id: '',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketConnect.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染截断 URL + id 文本', () => {
			const contents = Command.cases.webSocketConnect.parse!({
				url: 'wss://example.com/very-long-path-123456',
				id: 'ws1',
				protocols: '',
				onOpen: '',
				onMessage: '',
				onError: '',
				onClose: ''
			});
			expect(contents).toContainEqual({ text: 'wss://example.com/ve...' });
			expect(contents).toContainEqual({ text: 'ws1' });
		});
	});
}
{
	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useWebSocketSendCommandSchema（webSocketSend 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'webSocketSend');
			expect(Window.open).toHaveBeenCalledWith('webSocketSend');
			expect(getControl('webSocketSend-id').read()).toBe('');
			expect(getControl('webSocketSend-data').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'webSocketSend',
				params: { id: 'ws1', data: 'hello' }
			});
			expect(Window.open).toHaveBeenCalledWith('webSocketSend');
			expect(getControl('webSocketSend-id').read()).toBe('ws1');
			expect(getControl('webSocketSend-data').read()).toBe('hello');
			wrapper.unmount();
		});

		it('save 路径：id 为空时校验失败不保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: '', data: 'hello' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：data 为空时校验失败不保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：id/data 非空时经 Command.cases.webSocketSend.save 保存', async () => {
			const wrapper = mount(WebSocketSend, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: 'hello' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.webSocketSend.save!();
			expect(saved).toHaveBeenCalledWith({ id: 'ws1', data: 'hello' });
			wrapper.unmount();
		});
	});
}
