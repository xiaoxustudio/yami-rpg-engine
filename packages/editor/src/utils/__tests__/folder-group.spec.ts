import { describe, expect, it } from 'vitest';
import { folderGroupOf } from '@app/utils/folder-group';

/** T5b 步骤 5b：属性/枚举「set-as」共用的数据面反查 */
describe('folderGroupOf（分组反查）', () => {
	it('命中的分组键被返回', () => {
		const settings = { groupA: 'folder1', groupB: '', groupC: 'folder2' };
		expect(folderGroupOf(settings, 'folder1')).toBe('groupA');
		expect(folderGroupOf(settings, 'folder2')).toBe('groupC');
	});

	it('未归入任何分组时返回空串（空槽位不算归属）', () => {
		expect(folderGroupOf({ groupA: '', groupB: 'folder2' }, 'folder1')).toBe('');
		expect(folderGroupOf({}, 'folder1')).toBe('');
	});

	it('settings 缺失时返回空串（不抛错）', () => {
		expect(folderGroupOf(null, 'folder1')).toBe('');
		expect(folderGroupOf(undefined, 'folder1')).toBe('');
	});

	it('多组同 id（异常数据）取第一个键，行为稳定', () => {
		expect(folderGroupOf({ groupA: 'folder1', groupB: 'folder1' }, 'folder1')).toBe('groupA');
	});
});
