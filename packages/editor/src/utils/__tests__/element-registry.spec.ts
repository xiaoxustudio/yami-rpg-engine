import { describe, expect, it } from 'vitest';
import {
	createElementRegistry,
	registerElement,
	registryElements,
	registryRef
} from '@app/utils/element-registry';

describe('元素注册表（element-registry）', () => {
	it('默认注册表：registryRef 写入元素、卸载时清空该项', () => {
		const registry = createElementRegistry();
		const el = document.createElement('div');
		el.id = 'plain';

		registryRef(registry, 'plain')(el);
		expect(registry.get('plain')).toBe(el);

		registryRef(registry, 'plain')(null);
		expect(registry.get('plain')).toBe(null);
	});

	it('registryRef 收到组件实例时取 $el', () => {
		const registry = createElementRegistry();
		const root = document.createElement('div');
		const instance = { $el: root };

		registryRef(registry, 'widget')(instance);
		expect(registry.get('widget')).toBe(root);
	});

	it('镜像注册表：写入与清空都同步到目标注册表', () => {
		const shared = createElementRegistry();
		const local = createElementRegistry(shared);
		const el = document.createElement('div');
		el.id = 'mirrored';

		registryRef(local, 'mirrored')(el);
		expect(local.get('mirrored')).toBe(el);
		expect(shared.get('mirrored')).toBe(el);

		registryRef(local, 'mirrored')(null);
		expect(local.get('mirrored')).toBe(null);
		expect(shared.get('mirrored')).toBe(null);
	});

	it('镜像在 registerElement 路径同样生效', () => {
		const shared = createElementRegistry();
		const local = createElementRegistry(shared);
		const el = document.createElement('div');

		registerElement(local, 'named-ref', el);
		expect(shared.get('named-ref')).toBe(el);
	});

	it('多次登记同一键时目标注册表保持最后一次的值', () => {
		const shared = createElementRegistry();
		const local = createElementRegistry(shared);
		const first = document.createElement('div');
		const second = document.createElement('span');

		registryRef(local, 'dup')(first);
		registryRef(local, 'dup')(second);
		expect(shared.get('dup')).toBe(second);
	});

	it('registryElements：按 id 列表取元素，保持顺序并跳过未登记项', () => {
		const registry = createElementRegistry();
		const a = document.createElement('div');
		const b = document.createElement('div');
		a.id = 'a';
		b.id = 'b';

		registryRef(registry, 'a')(a);
		registryRef(registry, 'b')(b);

		expect(registryElements(registry, ['b', 'a'])).toEqual([b, a]);
		expect(registryElements(registry, ['a', 'missing', 'b'])).toEqual([a, b]);
		registryRef(registry, 'a')(null);
		expect(registryElements(registry, ['a', 'b'])).toEqual([b]);
		expect(registryElements(registry, [])).toEqual([]);
	});
});
