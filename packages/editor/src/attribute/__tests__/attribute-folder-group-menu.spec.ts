import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAttributeStore } from '@app/stores/attribute';

/**
 * T5b 步骤 5b 的**行为变更证据**（先写失败、后转绿）：
 *
 * 旧实现从行元素上读 `item.element?.group` 决定「set-as」子菜单的 checked —— 但全仓
 * **没有任何代码写行元素的 group 属性**（唯一的 `.group =` 赋值在
 * `engine/layout/layout.ts` 里，那是拖拽事件对象），因此该表达式恒为 `undefined`，
 * `checked: group === ''` 与 `checked: group === groupKey` **恒为 false**：
 * 菜单里从来不显示勾选。本用例按数据面（store 的 settings）断言正确勾选。
 */
const popup = vi.hoisted(() => vi.fn());

vi.mock('@app/components/menu-list.ts', () => ({
	Menu: { popup }
}));

const { Attribute } = await import('../attribute-window');

interface MenuLike {
	label?: string;
	submenu?: MenuLike[];
	checked?: boolean;
}

const openFolderPopup = (id: string): MenuLike[] => {
	popup.mockClear();
	Attribute.listPopup({
		value: { id, class: 'folder' },
		clientX: 10,
		clientY: 20
	} as unknown as Event & { clientX: number; clientY: number });
	expect(popup).toHaveBeenCalledTimes(1);
	return popup.mock.calls[0][1] as MenuLike[];
};

const setAsSubmenu = (items: MenuLike[]): MenuLike[] => {
	// 只有 set-as 子菜单的条目带 checked（create 子菜单没有）
	const entry = items.find(
		(item) => Array.isArray(item.submenu) && item.submenu.some((sub) => 'checked' in sub)
	);
	expect(entry, '未找到 set-as 子菜单').toBeTruthy();
	return entry!.submenu!;
};

describe('Attribute 右键菜单「set-as」勾选（数据面读取）', () => {
	beforeEach(() => {
		const store = getAttributeStore();
		store.state.settings = { groupA: 'folder1', groupB: '' };
		store.state.settingKeys = ['groupA', 'groupB'];
		store.state.history = {
			canUndo: () => false,
			canRedo: () => false,
			save: vi.fn()
		} as never;
	});

	it('已归入 groupA 的文件夹：groupA 勾选、none 与 groupB 不勾选', () => {
		const submenu = setAsSubmenu(openFolderPopup('folder1'));
		// 顺序固定：none → settingKeys 顺序
		expect(submenu).toHaveLength(3);
		expect(submenu[0].checked).toBe(false); // set-as.none
		expect(submenu[1].checked).toBe(true); // set-as.groupA
		expect(submenu[2].checked).toBe(false); // set-as.groupB
	});

	it('未归入任何分组的文件夹：只有 none 勾选', () => {
		const submenu = setAsSubmenu(openFolderPopup('folder-not-grouped'));
		expect(submenu[0].checked).toBe(true);
		expect(submenu[1].checked).toBe(false);
		expect(submenu[2].checked).toBe(false);
	});
});
