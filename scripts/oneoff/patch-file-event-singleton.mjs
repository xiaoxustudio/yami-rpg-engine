import { readFileSync, writeFileSync } from 'node:fs';

/** `file-event-page.ts`：4 处按 id 取元素 / attach 之后同步 → 页面桥。 */
const file = 'packages/editor/src/inspector/file-event-page.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { getFileEventParameterBridge } from '@app/composables/file-event-parameter-bridge';",
	"import { getFileEventParameterBridge } from '@app/composables/file-event-parameter-bridge';\nimport { getFileEventPageBridge } from '@app/composables/file-event-page-bridge';"
);

// open：类型候选项 + sync
text = text.replace(
	/\t\t\tinspectorEls\n\t\t\t\t\.get\('fileEvent-type'\)\n\t\t\t\t\?\.loadItems\?\.\(Enum\.getMergedItems!\(EventEditor\.types\?\.global, 'global-event'\)\);/,
	"\t\t\tgetFileEventPageBridge()?.loadTypeItems(\n\t\t\t\tEnum.getMergedItems!(EventEditor.types?.global, 'global-event')\n\t\t\t);"
);
text = text.replace(
	/\t\t\tregistryElement<HTMLElement & \{ sync\?: \(\) => void \}>\(\n\t\t\t\tinspectorEls,\n\t\t\t\t'fileEvent-vue-mount'\n\t\t\t\)\?\.sync\?\.\(\);/,
	'\t\t\tgetFileEventPageBridge()?.sync();'
);

// close：清空参数列表
text = text.replace(
	"\t\t\tclear(inspectorEls.get('fileEvent-parameters'));",
	'\t\t\tgetFileEventPageBridge()?.clearParameters();'
);

// write：sync
text = text.replace(
	"\t\tregistryElement<{ sync?: () => void }>(inspectorEls, 'fileEvent-vue-mount')?.sync?.();",
	'\t\tgetFileEventPageBridge()?.sync();'
);

// typeWrite：两行的显隐搬到页面桥
text = text.replace(
	/FileEvent\.typeWrite = function \(this: FileEventPage, event: Event & \{ value\?: string \}\) \{[\s\S]*?\n\t\};/,
	[
		'FileEvent.typeWrite = function (this: FileEventPage, event: Event & { value?: string }) {',
		'\tconst bridge = getFileEventPageBridge();',
		'\tconst value = event.value;',
		'\tswitch (value) {',
		"\t\tcase 'common':",
		'\t\t\tbridge?.setEnabledVisible(false);',
		'\t\t\tbreak;',
		'\t\tdefault:',
		'\t\t\tbridge?.setEnabledVisible(true);',
		'\t\t\tbreak;',
		'\t}',
		'\tconst showsPriority = [',
		"\t\t'input',",
		"\t\t'keydown',",
		"\t\t'keyup',",
		"\t\t'mousedown',",
		"\t\t'mouseup',",
		"\t\t'mousemove',",
		"\t\t'doubleclick',",
		"\t\t'wheel',",
		"\t\t'touchstart',",
		"\t\t'touchmove',",
		"\t\t'touchend',",
		"\t\t'gamepadbuttonpress',",
		"\t\t'gamepadbuttonrelease',",
		"\t\t'gamepadleftstickchange',",
		"\t\t'gamepadrightstickchange'",
		"\t].includes(value ?? '');",
		'\tbridge?.setPriorityVisible(showsPriority);',
		'\t};'
	].join('\n')
);

writeFileSync(file, text);

const leftovers = [
	...text.matchAll(
		/inspectorEls|registryElement|[^a-zA-Z]clear\(|hide\(enabled|show\(enabled|priorityLabel/g
	)
];
console.log(
	leftovers.length ? `! 仍有 ${leftovers.length} 处注册表/DOM 引用` : '✓ file-event-page 已改'
);
