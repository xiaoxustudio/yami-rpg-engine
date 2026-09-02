import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TextSuggestions from '@app/components/tools/TextSuggestions.vue';

interface SuggestionsListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface SuggestionData {
	name: string;
	class?: string;
	comment?: string;
	refCount?: number;
	element?: { content?: HTMLElement };
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

const makeData = (): SuggestionData[] => [
	{ name: 'varA', class: 'error', comment: '事件 1', refCount: 3 },
	{ name: 'varB', comment: '事件 2', refCount: 1 },
	{ name: 'plain' }
];

describe('TextSuggestions 行内容（nodeContent v-for 化后整行自绘回归保护）', () => {
	it('update 后渲染 content/ref-count/comment，且不残留默认名字文本', async () => {
		const wrapper = mount(TextSuggestions, {
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = document.getElementById('text-suggestions') as unknown as SuggestionsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();

		expect(el.querySelectorAll('.node-item').length).toBe(3);
		expect(el.querySelectorAll('.node-text').length).toBe(0);

		const contents = Array.from(el.querySelectorAll('.text-suggestion-content'));
		expect(contents.length).toBe(3);
		expect(contents[0].textContent).toBe('varA');
		expect((contents[0] as HTMLElement).className).toContain('error');
		expect(contents[1].textContent).toBe('varB');
		expect(contents[2].textContent).toBe('plain');

		const refCounts = Array.from(el.querySelectorAll('.text-suggestion-ref-count'));
		expect(refCounts.length).toBe(2);
		expect(refCounts[0].textContent).toBe('3');
		expect(refCounts[1].textContent).toBe('1');

		const comments = Array.from(el.querySelectorAll('.text-suggestion-comment'));
		expect(comments.length).toBe(2);
		expect(comments[0].textContent).toBe('事件 1');
		expect(comments[1].textContent).toBe('事件 2');

		wrapper.unmount();
	});

	it('数据变更后经 list.update 刷新行内容（ref-count/comment 更新）', async () => {
		const wrapper = mount(TextSuggestions, {
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = document.getElementById('text-suggestions') as unknown as SuggestionsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();

		(data[0] as SuggestionData).refCount = 8;
		(data[0] as SuggestionData).comment = '重命名后';
		(data[1] as SuggestionData).refCount = undefined;
		(data[1] as SuggestionData).comment = undefined;
		el.update();

		const refCounts = Array.from(el.querySelectorAll('.text-suggestion-ref-count'));
		expect(refCounts.length).toBe(1);
		expect(refCounts[0].textContent).toBe('8');

		const comments = Array.from(el.querySelectorAll('.text-suggestion-comment'));
		expect(comments.length).toBe(1);
		expect(comments[0].textContent).toBe('重命名后');

		const contents = Array.from(el.querySelectorAll('.text-suggestion-content'));
		expect(contents.length).toBe(3);
		expect(contents[0].textContent).toBe('varA');

		const item0 = data[0];
		const item0Content = item0.element as { rowContent?: HTMLElement } | undefined;
		expect(
			item0Content?.rowContent?.querySelector('.text-suggestion-ref-count')?.textContent
		).toBe('8');
		wrapper.unmount();
	});
});
