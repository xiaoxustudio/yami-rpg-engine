import { readFileSync, writeFileSync } from 'node:fs';

/**
 * 把 text-capture 单例里的「窗口内装配」搬进各窗口：候选项与隐藏行关系是**窗口自己的配置**，
 * 单例只需保留 open/confirm（它们已经走 `useTextCaptureWindow`，不碰 id）。
 */

const wiring = {
	'packages/editor/src/components/tools/TextPosition.vue': `
/** 候选与联动是窗口自己的配置（原在 \`Selection.textPosition.initialize\` 里按 id 取元素）。 */
onMounted(() => {
	controls['textPosition-axis']?.loadItems?.([
		{ name: 'X', value: 'x' },
		{ name: 'Y', value: 'y' }
	]);
	controls['textPosition-operation']?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' }
	]);
});
`,
	'packages/editor/src/components/tools/TextEffect.vue': `
/** 候选与隐藏行关系是窗口自己的配置（原在 \`Selection.textEffect.initialize\` 里按 id 取元素）。 */
onMounted(() => {
	const type = controls['textEffect-type'];
	type?.loadItems?.([
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	type?.enableHiddenMode?.();
	type?.relate?.([
		{
			case: 'shadow',
			targets: [
				controlRoot(controls['textEffect-shadowOffsetX']),
				controlRoot(controls['textEffect-shadowOffsetY']),
				controlRoot(controls['textEffect-color'])
			]
		},
		{
			case: 'stroke',
			targets: [
				controlRoot(controls['textEffect-strokeWidth']),
				controlRoot(controls['textEffect-color'])
			]
		},
		{ case: 'outline', targets: [controlRoot(controls['textEffect-color'])] }
	]);
});
`,
	'packages/editor/src/components/tools/InsertImage.vue': `
/** 模式候选与隐藏行关系是窗口自己的配置（原在 \`Selection.image.initialize\` 里按 id 取元素）。 */
onMounted(() => {
	const mode = controls['insertImage-mode'];
	mode?.loadItems?.([
		{ name: 'Image', value: 'image' },
		{ name: 'Image - Size', value: 'image-size' },
		{ name: 'Image - Clip', value: 'image-clip' },
		{ name: 'Image - Clip - Size', value: 'image-clip-size' }
	]);
	mode?.enableHiddenMode?.();
	mode?.relate?.([
		{ case: 'image', targets: [controlRoot(controls['insertImage-image'])] },
		{
			case: 'image-size',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-width']),
				controlRoot(controls['insertImage-height'])
			]
		},
		{
			case: 'image-clip',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-clip'])
			]
		},
		{
			case: 'image-clip-size',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-clip']),
				controlRoot(controls['insertImage-width']),
				controlRoot(controls['insertImage-height'])
			]
		}
	]);
});
`,
	'packages/editor/src/components/tools/LocalVariable.vue': `
/** 变量名输入框的候选来源是窗口自己的配置（原在 \`Selection.localVariable.initialize\` 里按 id 取元素）。 */
onMounted(() => {
	TextSuggestion.listen!(
		controlRoot(controls['localVariable-key']) as TextSuggestionTarget,
		VariableGetter.createVarListGenerator!({ filter: 'all' } as never)
	);
});
`
};

for (const [file, block] of Object.entries(wiring)) {
	let text = readFileSync(file, 'utf8');
	if (!text.includes('onMounted(')) {
		text = text.replace(
			"import { useI18n } from 'vue-i18n';",
			"import { onMounted } from 'vue';\nimport { useI18n } from 'vue-i18n';"
		);
	}
	if (block.includes('controlRoot(') && !/import \{[^}]*controlRoot/.test(text)) {
		text = text.replace(
			"import { useControlRefs } from '@app/composables/control-refs';",
			"import { controlRoot, useControlRefs } from '@app/composables/control-refs';"
		);
	}
	if (block.includes('TextSuggestion')) {
		text = text.replace(
			"import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';",
			"import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';\nimport { TextSuggestion, type TextSuggestionTarget } from '@app/commands/text-tip.ts';\nimport { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';"
		);
	}
	text = text.replace(/\n<\/script>/, `\n${block}</script>`);
	writeFileSync(file, text);
	console.log(`✎ ${file}`);
}
