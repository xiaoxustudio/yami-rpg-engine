import { describe, expect, it } from 'vitest';
import { getEditorStore } from '@app/stores/editor';

describe('useEditorStore（Phase 10——Editor.config 状态桥接）', () => {
	it('setConfig 承载 config 且可读回', () => {
		const store = getEditorStore();
		store.setConfig({ language: 'zh-CN', version: '1.0.0' });
		expect(store.config.language).toBe('zh-CN');
		expect(store.project).toBe(null);
	});

	it('setConfig 同步 project（config.project 存在时）', () => {
		const store = getEditorStore();
		store.setConfig({ project: { id: 'p1' } });
		expect(store.project.id).toBe('p1');
	});

	it('setProject 独立设置 project', () => {
		const store = getEditorStore();
		store.setProject({ id: 'p2' });
		expect(store.project.id).toBe('p2');
	});

	it('setState 切换编辑器状态', () => {
		const store = getEditorStore();
		store.setState('open');
		expect(store.state).toBe('open');
		store.setState('closed');
		expect(store.state).toBe('closed');
	});
});
