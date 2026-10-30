import { beforeEach, describe, expect, it } from 'vitest';
import { getMissingKeys, recordMissingKey, resetMissingKeys } from '../missing-keys';

describe('i18n 运行期缺失观测', () => {
	beforeEach(() => {
		resetMissingKeys();
	});

	it('只记录受管命名空间（components. / properties.）', () => {
		recordMissingKey('components.save-file');
		recordMissingKey('properties.width');
		// 工程侧注入的命名空间不算缺失（它们不在编辑器语言包里）
		recordMissingKey('command.reset');
		recordMissingKey('common.delete');
		recordMissingKey('confirmation.resource-download');
		expect(getMissingKeys()).toEqual(['components.save-file', 'properties.width']);
	});

	it('同一 key 只记一次，且忽略非 key 形状', () => {
		recordMissingKey('components.a');
		recordMissingKey('components.a');
		recordMissingKey('nokey');
		recordMissingKey('');
		expect(getMissingKeys()).toEqual(['components.a']);
	});

	it('同步到 window.__I18N_MISSING__（真机 E2E 的断言入口）', () => {
		const exposed = () => (window as Window & { __I18N_MISSING__?: string[] }).__I18N_MISSING__;
		recordMissingKey('components.sync');
		expect(exposed()).toEqual(['components.sync']);
		resetMissingKeys();
		expect(exposed()).toEqual([]);
	});
});
