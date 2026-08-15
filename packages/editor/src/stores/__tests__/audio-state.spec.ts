import { describe, expect, it } from 'vitest';
import { getAudioStore } from '@app/stores/audio';
import { AudioManager } from '@/audio/audio-manager.ts';

describe('useAudioStore（AudioManager 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getAudioStore();
		expect(store.state).toBe('closed');
		expect(store.music).toBe(null);
	});

	it('字段直接赋值读回', () => {
		const store = getAudioStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.music = { name: 'bgm' };
		expect(store.music).toEqual({ name: 'bgm' });
		store.state = 'closed';
		store.music = null;
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getAudioStore();
		AudioManager.playMusic!('bgm');
		expect(store.music).toEqual({ name: 'bgm' });
		AudioManager.stopMusic!();
		expect(store.music).toBe(null);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getAudioStore();
		store.state = 'open';
		expect(AudioManager.state).toBe('open');
		store.state = 'closed';
		expect(AudioManager.state).toBe('closed');
		store.music = { name: 'se' };
		expect(AudioManager.music).toEqual({ name: 'se' });
		store.music = null;
		expect(AudioManager.music).toBe(null);
	});
});
