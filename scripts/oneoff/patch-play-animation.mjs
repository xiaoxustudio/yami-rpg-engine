import { readFileSync, writeFileSync } from 'node:fs';

/** PlayAnimation 窗口：`reloadMotion` 要保持「换动画后回写旧动作」的语义（loadItems + write2(read)）。 */
const windowFile = 'packages/editor/src/components/commands/PlayAnimation.vue';
let w = readFileSync(windowFile, 'utf8');
w = w.replace(
	/reloadMotion: \(items\) => \{\n\t\tcontrols\['playAnimation-motion'\]\?\.loadItems\?\.\(items\);\n\t\}/,
	`reloadMotion: (items) => {
		controls['playAnimation-motion']?.loadItems?.(items);
		controls['playAnimation-motion']?.write2?.(
			controls['playAnimation-motion']?.read?.() as string
		);
	}`
);
writeFileSync(windowFile, w);

/** schema：三行按 id 取元素 + loadItems + write2 → 一次桥调用。 */
const schemaFile = 'packages/editor/src/composables/commands/usePlayAnimationCommandSchema.ts';
let s = readFileSync(schemaFile, 'utf8');
s = s.replace(
	/\t\tconst elMotion = composableEls\.get\('playAnimation-motion'\) as YamiElement;\n\t\telMotion\?\.loadItems\?\.\(Animation\.getMotionListItems!\(event\.value\)\);\n\t\telMotion\?\.write2\?\.\(read\(elMotion\)\);/,
	'\t\tgetPlayAnimationBridge()?.reloadMotion(Animation.getMotionListItems!(event.value));'
);
s = s.replace(
	"import { composableEls } from '@app/composables/element-registry';",
	"import { getPlayAnimationBridge } from '@app/composables/play-animation-bridge';"
);
writeFileSync(schemaFile, s);
console.log('✎ PlayAnimation window + schema');
