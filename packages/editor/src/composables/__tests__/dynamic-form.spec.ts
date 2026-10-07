import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { dynamicForm } from '@app/composables/dynamic-form';

describe('dynamicForm（动态键表单访问器）', () => {
	it('读写转发到切片，且保留 Object.assign / 展开 / in / delete', () => {
		const slice = reactive<Record<string, unknown>>({ a: 1 });
		const form = dynamicForm(() => slice);

		expect(form.a).toBe(1);
		form.b = 2;
		expect(slice.b).toBe(2);

		Object.assign(form, { a: 5, c: 3 });
		expect(slice).toMatchObject({ a: 5, b: 2, c: 3 });

		expect({ ...form }).toEqual({ a: 5, b: 2, c: 3 });
		expect('a' in form).toBe(true);
		expect('zzz' in form).toBe(false);
		expect(Object.keys(form).sort()).toEqual(['a', 'b', 'c']);

		delete form.b;
		expect('b' in form).toBe(false);
		expect(slice).not.toHaveProperty('b');
	});

	it('响应性：切片变化后经 form 读到新值（源头是 store 那个 reactive 对象）', () => {
		const slice = reactive<Record<string, unknown>>({ n: 1 });
		const form = dynamicForm(() => slice);
		slice.n = 42;
		expect(form.n).toBe(42);
	});

	it('每次读写都重新取切片（选择器形态）⇒ 换切片即换真源，不存在早绑定', () => {
		const a = reactive<Record<string, unknown>>({ v: 'a' });
		const b = reactive<Record<string, unknown>>({ v: 'b' });
		let current = a;
		const form = dynamicForm(() => current);
		expect(form.v).toBe('a');
		current = b;
		expect(form.v).toBe('b');
		form.v = 'b2';
		expect(b.v).toBe('b2');
		expect(a.v).toBe('a');
	});
});
