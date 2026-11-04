import { readFileSync, writeFileSync } from 'node:fs';

const files = [
	'packages/editor/src/components/tools/TextPosition.vue',
	'packages/editor/src/components/tools/TextEffect.vue',
	'packages/editor/src/components/tools/InsertImage.vue',
	'packages/editor/src/components/tools/LocalVariable.vue'
];

for (const file of files) {
	let text = readFileSync(file, 'utf8');
	text = text.replace(
		/const \{ controlRef \} = useControlRefs<Id>\(\);/,
		'const { controls, controlRef } = useControlRefs<Id>();'
	);
	if (text.includes('controlRoot(') && !/import \{[^}]*controlRoot/.test(text)) {
		text = text.replace(
			"import { useControlRefs } from '@app/composables/control-refs';",
			"import { controlRoot, useControlRefs } from '@app/composables/control-refs';"
		);
	}
	writeFileSync(file, text);
	console.log(`✎ ${file}`);
}

// Font.vue：不再登记任何注册表，把 registryRef / textCaptureEls / windowShellEls 的用法删干净
const fontFile = 'packages/editor/src/components/tools/Font.vue';
let font = readFileSync(fontFile, 'utf8');
font = font.replace(/import \{ registryRef \} from '@app\/utils\/element-registry';\n/, '');
font = font.replace(
	/import \{ Selection, textCaptureEls \} from '@app\/tools\/text-capture\.ts';\n/,
	"import { Selection } from '@app/tools/text-capture.ts';\n"
);
font = font.replace(/import \{ windowShellEls \} from '@app\/tools\/window-object\.ts';\n/, '');
font = font.replace(
	/\/\/ 同一个根元素要进两个注册表[\s\S]*?const captureRef = registryRef\(textCaptureEls, 'font'\);\nconst shellRef = registryRef\(windowShellEls, 'font'\);\n/,
	''
);
writeFileSync(fontFile, font);
console.log(`✎ ${fontFile}`);
