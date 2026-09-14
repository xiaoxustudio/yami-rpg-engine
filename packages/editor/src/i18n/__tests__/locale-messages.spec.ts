import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { applyLocaleData, getYamiI18n, initYamiI18n } from '@app/i18n';
import { convertLocaleData, type LocaleData } from '@app/i18n/convert';

/**
 * 语言文件全量「可编译 / 不失真」回归。
 *
 * vue-i18n 把消息体当模板编译：`@` 是 linked message 语法、`|` 是复数分隔符、
 * `{name}` 是命名插值。文案里的这些字符会被当成语法——轻则内容丢失（`{Y}` 无参数时
 * 渲染成空串），重则直接抛编译错误（`@code` → Invalid linked format；
 * `{0, 1, 2, 3, ...}` → Unterminated closing brace）。`t()` 又在 render 里同步调用，
 * 抛错会连带炸掉整个窗口渲染（Vue: Unhandled error during execution of render function，
 * 表现为 downloadFile / uploadFile / requestURL / httpRequest / webSocketConnect 等窗口报错）。
 *
 * `convert.ts` 在转换边界做字面量转义，这里锁住两条不变量：① 每个键都能编译；
 * ② 每条 `.tip` 逐字渲染（不被语法字符吃掉内容）。
 */
const LOCALES_DIR = resolve(process.cwd(), 'Project/Locales');

type Locale = { file: string; lang: string; data: LocaleData };

function loadLocales(): Locale[] {
	return readdirSync(LOCALES_DIR)
		.filter((name) => name.toLowerCase().endsWith('.json'))
		.map((file) => ({
			file,
			lang: file.split('.')[0],
			data: JSON.parse(readFileSync(resolve(LOCALES_DIR, file), 'utf8')) as LocaleData
		}));
}

/** 语言 JSON 里所有 `.tip` 的原始文案（key → raw） */
function collectTips(data: LocaleData): Map<string, string> {
	const out = new Map<string, string>();
	const walk = (obj: Record<string, unknown>, prefix: string): void => {
		for (const key of Object.keys(obj)) {
			const value = obj[key];
			const path = `${prefix}${key}`;
			if (value !== null && typeof value === 'object') {
				walk(value as Record<string, unknown>, `${path}.`);
			} else if (typeof value === 'string' && path.endsWith('.tip')) {
				out.set(path, value);
			}
		}
	};
	walk(data.properties ?? {}, '');
	walk(data.components as unknown as Record<string, unknown>, 'components.');
	return out;
}

const locales = loadLocales();

describe('语言文件消息可编译 / 不失真（@ | {} 字面量转义）', () => {
	it('存在语言文件', () => {
		expect(locales.length).toBeGreaterThan(0);
	});

	for (const { file, lang, data } of locales) {
		it(`${file}：全部键都能被 t() 编译`, () => {
			initYamiI18n();
			applyLocaleData(lang, data);
			const t = getYamiI18n().global.t;

			const failed: string[] = [];
			for (const key of Object.keys(convertLocaleData(data))) {
				try {
					t(key);
				} catch (error) {
					failed.push(`${key}: ${(error as Error).message.split('\n')[0]}`);
				}
			}
			expect(failed).toEqual([]);
		});

		it(`${file}：tip 文案逐字渲染（语法字符不吃内容）`, () => {
			initYamiI18n();
			applyLocaleData(lang, data);
			const t = getYamiI18n().global.t;

			const tips = collectTips(data);
			expect(tips.size).toBeGreaterThan(0);
			const broken: string[] = [];
			for (const [key, raw] of tips) {
				let rendered: string;
				try {
					rendered = t(key);
				} catch (error) {
					broken.push(`${key}: ${(error as Error).message.split('\n')[0]}`);
					continue;
				}
				if (rendered !== raw) {
					broken.push(`${key}: ${JSON.stringify(rendered)} !== ${JSON.stringify(raw)}`);
				}
			}
			expect(broken).toEqual([]);
		});
	}

	it('命名插值 {name} 未被转义破坏', () => {
		initYamiI18n();
		const lang = locales[0].lang;
		applyLocaleData(lang, locales[0].data);
		const t = getYamiI18n().global.t as unknown as (
			key: string,
			named?: Record<string, unknown>
		) => string;

		expect(t('menuFileOnDrop.moveTo', { dirName: 'Scenes' })).toContain('Scenes');
		expect(t('confirmation.deleteSingleFile', { filename: 'a.scene' })).toContain('a.scene');
	});

	it('legacy 本地化器仍读原始 JSON（tooltip 文案不被转义污染）', () => {
		const { data } = locales[0];
		expect(data.components['downloadFile-callback'].tip).toContain('@code');
		expect(data.components['setString-operand-parse-timestamp-format'].tip).toContain('{Y}');
	});
});
