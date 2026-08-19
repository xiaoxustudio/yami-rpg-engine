import { initCommandColorBridges } from './command-color.ts';
import { initCommandUtilBridges } from './command-util.ts';
import { initCommandParseBridges } from './command-parse.ts';

export function initCommandBridges(): void {
	initCommandColorBridges();
	initCommandUtilBridges();
	initCommandParseBridges();
}
