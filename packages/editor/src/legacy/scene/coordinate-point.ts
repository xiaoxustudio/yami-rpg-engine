import { Scene } from './scene-window.ts';

Scene.Point = class Point {
	x: number;
	y: number;

	constructor() {
		this.x = 0;
		this.y = 0;
	}

	set(x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}
};
