import { beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, ref, Teleport } from 'vue';

// M3 方案 A 前提试验（docs/layout-vue-plan.md 附录 C.3 / 风险 R1-R2）：
// 页面内容块用动态 Teleport 挂到「命令式创建的 group manager」元素：
// 1) :to 在 managerA↔managerB 间切换只移动不重建子组件；
// 2) manager 内被命令式插入的外部兄弟节点，在 Vue patch 期间不被吞掉；
// 3) 目标清空（disabled 兜底）时内容回到宿主位，仍不重建。
// 若此试验绿 → 页面归属 Teleport 化（M3b）在渲染层可行；红 → 方案 A 需重设计。

const createManager = (name: string): HTMLElement => {
	const el = document.createElement('div');
	el.className = 'page-manager group-manager';
	el.id = name;
	return el;
};

describe('Teleport 动态归属（方案 A 前提）', () => {
	let mounts = 0;

	const ProbeChild = defineComponent({
		setup() {
			onMounted(() => {
				mounts += 1;
			});
			return () => h('span', { class: 'probe-child' }, 'child');
		}
	});

	const buildHost = () => {
		const manager = ref<HTMLElement | null>(null);
		const tick = ref(0);
		const Host = defineComponent({
			setup() {
				return () => [
					h('div', { class: 'probe-host-root' }),
					h(
						Teleport,
						{
							disabled: manager.value === null || !manager.value.isConnected,
							to: manager.value ?? 'body'
						},
						h('div', { class: 'probe-page' }, [
							h(ProbeChild),
							h('span', { class: 'probe-text' }, `tick:${tick.value}`)
						])
					)
				];
			}
		});
		return {
			Host,
			controls: {
				setManager: (el: HTMLElement | null): void => {
					manager.value = el;
				},
				bump: (): void => {
					tick.value += 1;
				}
			}
		};
	};

	beforeEach(() => {
		mounts = 0;
		document.body.innerHTML = '';
	});

	it('在命令式 manager 间搬家不重建；外部兄弟节点共存时 patch 不冲突', async () => {
		const managerA = createManager('manager-a');
		const managerB = createManager('manager-b');
		document.body.append(managerA, managerB);
		const hostHost = document.createElement('div');
		document.body.append(hostHost);

		const { Host, controls } = buildHost();
		let wrapper: VueWrapper | null = null;
		try {
			wrapper = mount(Host, { attachTo: hostHost });

			const page = (): HTMLElement => document.querySelector('.probe-page') as HTMLElement;
			expect(mounts).toBe(1);
			expect(page()).toBeTruthy();
			expect(page().parentNode).not.toBe(managerA);

			controls.setManager(managerA);
			await nextTick();
			expect(page().parentNode).toBe(managerA);
			expect(mounts).toBe(1);

			const extra = document.createElement('div');
			extra.className = 'probe-extra';
			managerA.appendChild(extra);

			controls.bump();
			await nextTick();
			expect(page().parentNode).toBe(managerA);
			expect(page().textContent).toContain('tick:1');
			expect(extra.parentNode).toBe(managerA);
			expect(extra.isConnected).toBe(true);

			controls.setManager(managerB);
			await nextTick();
			expect(page().parentNode).toBe(managerB);
			expect(mounts).toBe(1);
			expect(extra.parentNode).toBe(managerA);
			expect(extra.isConnected).toBe(true);

			controls.setManager(null);
			await nextTick();
			expect(document.querySelector('.probe-page')).toBeTruthy();
			expect(page().parentNode).not.toBe(managerA);
			expect(page().parentNode).not.toBe(managerB);
			expect(mounts).toBe(1);
		} finally {
			wrapper?.unmount();
		}
	});
});
