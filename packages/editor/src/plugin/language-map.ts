import { getLocalStore } from '@app/stores/local';

export type LanguagePackShape = {
	name: string;
	code?: string;
	base?: string;
	map?: Record<string, string>;
	[k: string]: unknown;
};

export const langProp = /(#\S+)\s+([\s\S]+?)(?=\s+#|$)/g;

// 插件语言包映射：按当前语言选择匹配度最高的 pack 并解析 #key 映射表
export class LanguageMap {
	language: string;
	active: Record<string, string>;
	packs: LanguagePackShape[];
	constructor() {
		this.language = '';
		this.active = {};
		this.packs = [];
	}

	update() {
		if (this.language !== getLocalStore().language) {
			this.language = getLocalStore().language;
			const packs = this.packs;
			let active = packs[0];
			let matchedWeight = 0;
			const sKeys = getLocalStore().language.split('-');
			for (const pack of packs) {
				const dKeys = pack.name.split('-');
				if (sKeys[0] === dKeys[0]) {
					let weight = 0;
					for (let sKey of sKeys) {
						if (dKeys.includes(sKey)) {
							weight++;
						}
					}
					if (matchedWeight < weight) {
						matchedWeight = weight;
						active = pack;
					}
				}
			}
			if (active) {
				this.parse(active);
				this.active = active.map!;
			}
		}
		return this;
	}

	parse(pack: LanguagePackShape) {
		const code = pack.code;
		if (code !== undefined) {
			delete pack.code;
			let match;
			const base = pack.base;
			const map = (pack.map = {} as Record<string, string>);
			while ((match = langProp.exec(code))) {
				map[match[1]] = match[2];
			}
			if (!base) return;
			for (const pack of this.packs) {
				if (pack.name === base) {
					this.parse(pack);
					// 避免循环继承报错
					try {
						Object.setPrototypeOf(map, pack.map!);
					} catch (_error: unknown) {}
				}
			}
		}
	}

	get(key: string) {
		if (key && key[0] === '#') {
			return this.active[key] ?? key;
		}
		return key;
	}

	append(pack: LanguagePackShape) {
		const { name } = pack;
		const { packs } = this;
		for (const pack of packs) {
			if (pack.name === name) {
				return;
			}
		}
		packs.push(pack);
	}
}
