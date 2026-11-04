import { readFileSync, writeFileSync } from 'node:fs';

/** importLanguage 单例：`localEls.get(...)` 三处 → 走桥（loadItems / write2 / read）。 */
const file = 'packages/editor/src/local/import-language-window.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { localEls } from '@app/local/element-registry';",
	"import { getImportLanguageBridge } from '@app/composables/import-language-bridge';"
);

const initRe =
	/\tImportLanguage\.initialize = function \(this: typeof ImportLanguage\) \{\n\t\tif \(!localEls\.get\('importLanguage'\)\) return;\n\t\};/;
const initReplacement =
	'\t/** 控件能力由窗口在挂载时经桥交出（importLanguage-language 已不进注册表）。 */\n' +
	'\tImportLanguage.initialize = function (this: typeof ImportLanguage) {};';
text = text.replace(initRe, initReplacement);

text = text.replace(
	/\t\t\t\tlocalEls\.get\('importLanguage-language'\)\?\.loadItems\?\.\(items\);\n\t\t\t\tlocalEls\.get\('importLanguage-language'\)\?\.write2\?\.\(language\);/,
	'\t\t\t\tgetImportLanguageBridge()?.loadItems(items);\n\t\t\t\tgetImportLanguageBridge()?.setLanguage(language);'
);

text = text.replace(
	/\tconst language = read\(localEls\.get\('importLanguage-language'\) as YamiElement\);/,
	'\tconst language = getImportLanguageBridge()?.getLanguage();'
);

writeFileSync(file, text);
console.log(/localEls/.test(text) ? '! 仍有 localEls 引用' : '✓ importLanguage 单例已改');
