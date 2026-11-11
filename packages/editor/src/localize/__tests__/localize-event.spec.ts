import { describe, expect, it } from 'vitest';
import { setLocalElement } from '@app/localize/dom-localizer';
import { onLocalize, requestLocalize } from '@app/localize/localize-event';

describe('本地化事件契约（yami-localize）', () => {
	it('onLocalize 收到 requestLocalize 派发的 detail', () => {
		const el = document.createElement('div');
		const seen: unknown[] = [];
		onLocalize(el, (detail) => seen.push(detail));
		requestLocalize(el, { kind: 'title', text: 'Hello' });
		expect(seen).toEqual([{ kind: 'title', text: 'Hello' }]);
	});

	it('setLocalElement 在 window-frame 上派发 title 事件（控件自己应用标题）', () => {
		const el = document.createElement('div');
		el.className = 'window-frame';
		const seen: unknown[] = [];
		onLocalize(el, (detail) => seen.push(detail));
		setLocalElement(el, { title: '本地化标题' });
		expect(seen).toEqual([{ kind: 'title', text: '本地化标题' }]);
	});

	it('setLocalElement 在 select-box 上派发 options 事件', () => {
		const el = document.createElement('div');
		el.className = 'select-box';
		const seen: unknown[] = [];
		onLocalize(el, (detail) => seen.push(detail));
		setLocalElement(el, { options: ['a', 'b'] });
		expect(seen).toEqual([{ kind: 'options', options: ['a', 'b'] }]);
	});

	it('没有监听方时派发不抛错（旧式元素靠元素方法兜底）', () => {
		const el = document.createElement('div');
		el.className = 'window-frame';
		expect(() => setLocalElement(el, { title: 'x' })).not.toThrow();
	});
});
