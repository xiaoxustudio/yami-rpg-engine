import { describe, it, expect, vi } from 'vitest';
import { createRadioProxy, radioProxyMap, RadioProxy } from '../radio-proxy';

function makeProxy(id: string, value: any = null) {
	const el = createRadioProxy() as any;
	el.id = id;
	el.setAttribute('name', id);
	el.dataValue = value;
	el.style.display = '';
	document.body.appendChild(el);
	return el;
}

describe('radio-proxy', () => {
	it('createRadioProxy builds hidden div with api', () => {
		const el = createRadioProxy() as any;
		expect(el.className).toBe('radio-proxy');
		expect(el.style.display).toBe('none');
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.relate).toBe('function');
		expect(radioProxyMap).toBe(RadioProxy.map);
	});

	it('write toggles selected among same-name elements', () => {
		const a = makeProxy('group1', 'a');
		const b = makeProxy('group1', 'b');
		b.write('b');
		expect(b.classList.contains('selected')).toBe(true);
		expect(a.classList.contains('selected')).toBe(false);
		expect(b.read()).toBe('b');
		a.remove();
		b.remove();
	});

	it('input dispatches change when value differs', () => {
		const proxy = makeProxy('group2', null);
		const r1 = makeProxy('group2', 'a');
		const onChange = vi.fn();
		proxy.addEventListener('change', onChange);
		proxy.input('a');
		expect(proxy.read()).toBe('a');
		expect(r1.classList.contains('selected')).toBe(true);
		expect(onChange).toHaveBeenCalledTimes(1);
		proxy.input('a');
		expect(onChange).toHaveBeenCalledTimes(1);
		proxy.remove();
		r1.remove();
	});

	it('relate enables matching targets and disables others', () => {
		const proxy = makeProxy('group3', null);
		const r1 = makeProxy('group3', 'a');
		const r2 = makeProxy('group3', 'b');
		const t1 = makeProxy('t1');
		const t2 = makeProxy('t2');
		proxy.relate([
			{ case: 'a', targets: [t1] },
			{ case: 'b', targets: [t2] }
		]);
		proxy.write('a');
		expect(t1.classList.contains('disabled')).toBe(false);
		expect(t2.classList.contains('disabled')).toBe(true);
		proxy.write('b');
		expect(t1.classList.contains('disabled')).toBe(true);
		expect(t2.classList.contains('disabled')).toBe(false);
		proxy.remove();
		r1.remove();
		r2.remove();
		t1.remove();
		t2.remove();
	});

	it('reset clears selection and dataValue', () => {
		const a = makeProxy('group4', 'a');
		a.write('a');
		a.reset();
		expect(a.read()).toBe(null);
		expect(a.classList.contains('selected')).toBe(false);
		a.remove();
	});
});
