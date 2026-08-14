import { beforeEach, describe, expect, it } from 'vitest';
import { Animation } from '@/animation/animation-window.ts';
import { getAnimationStore } from '@app/stores/animation';

describe('animation-window 控件值桥接（Animation ↔ animation store 双向绑定）', () => {
	const store = getAnimationStore();

	beforeEach(() => {
		Animation.showMark = false;
		Animation.showOnionskin = false;
		Animation.mirror = false;
		Animation.loop = false;
		Animation.playing = false;
		Animation.speed = null;
		Animation.zoom = null;
		store.syncState();
	});

	it('syncState 从 Animation 读取控件值', () => {
		Animation.showMark = true;
		Animation.showOnionskin = true;
		Animation.mirror = true;
		Animation.loop = true;
		Animation.playing = true;
		Animation.speed = 1.5;
		Animation.zoom = 3;
		store.syncState();
		expect(store.showMark).toBe(true);
		expect(store.showOnionskin).toBe(true);
		expect(store.mirror).toBe(true);
		expect(store.loop).toBe(true);
		expect(store.playing).toBe(true);
		expect(store.speed).toBe(1.5);
		expect(store.zoom).toBe(3);
	});

	it('Animation 属性写入实时反映到 store（bridge 桥接）', () => {
		Animation.switchMark!();
		expect(store.showMark).toBe(true);
		Animation.switchMark!();
		expect(store.showMark).toBe(false);
		Animation.switchOnionskin!();
		expect(store.showOnionskin).toBe(true);
		Animation.switchMirror!();
		expect(store.mirror).toBe(true);
		Animation.switchLoop!();
		expect(store.loop).toBe(true);
	});

	it('store 写入实时反映到 Animation（bridge 反向）', () => {
		store.showMark = true;
		expect(Animation.showMark).toBe(true);
		store.mirror = true;
		expect(Animation.mirror).toBe(true);
		store.loop = true;
		expect(Animation.loop).toBe(true);
		store.playing = true;
		expect(Animation.playing).toBe(true);
	});

	it('setSpeed/setZoom 经 bridge 更新 store 控件值', () => {
		Animation.setSpeed!(2);
		expect(store.speed).toBe(2);
		expect(Animation.speed).toBe(2);
		Animation.setZoom!(4);
		expect(store.zoom).toBe(4);
		expect(Animation.zoom).toBe(4);
	});

	it('播放状态 playing 经 bridge 同步', () => {
		Animation.playing = true;
		expect(store.playing).toBe(true);
		Animation.playing = false;
		expect(store.playing).toBe(false);
	});
});
