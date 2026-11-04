import { readFileSync, writeFileSync } from 'node:fs';

/**
 * 给三个「写入联动」窗口补桥接线（生成器只认 `onMounted(() => {` 形态，这三个窗口没有 onMounted）：
 *   AddAnimationComponent / RemoveAnimationComponent：`reloadMotion(items)` = loadItems + write2(read)
 *   ChangeActorSprite：`reloadSprite(items)` 同上
 */
const jobs = [
	{
		file: 'packages/editor/src/components/commands/AddAnimationComponent.vue',
		iface: 'AddAnimationComponentBridge',
		provide: 'provideAddAnimationComponentBridge',
		reset: 'resetAddAnimationComponentBridge',
		method: 'reloadMotion',
		control: 'addAnimationComponent-motion'
	},
	{
		file: 'packages/editor/src/components/commands/RemoveAnimationComponent.vue',
		iface: 'RemoveAnimationComponentBridge',
		provide: 'provideRemoveAnimationComponentBridge',
		reset: 'resetRemoveAnimationComponentBridge',
		method: 'reloadMotion',
		control: 'removeAnimationComponent-motion'
	},
	{
		file: 'packages/editor/src/components/commands/ChangeActorSprite.vue',
		iface: 'ChangeActorSpriteBridge',
		provide: 'provideChangeActorSpriteBridge',
		reset: 'resetChangeActorSpriteBridge',
		method: 'reloadSprite',
		control: 'changeActorSprite-spriteId'
	}
];

for (const job of jobs) {
	let text = readFileSync(job.file, 'utf8');
	if (!text.includes("from 'vue'")) {
		text = text.replace(
			/^import \{ useI18n \} from 'vue-i18n';/m,
			"import { onMounted, onUnmounted } from 'vue';\nimport { useI18n } from 'vue-i18n';"
		);
	} else {
		text = text.replace(
			/import \{ onMounted \} from 'vue';/,
			"import { onMounted, onUnmounted } from 'vue';"
		);
		text = text.replace(/import \{ ([^}]*)\} from 'vue';/, (m, inner) =>
			inner.includes('onUnmounted')
				? m
				: `import { ${inner.trimEnd()}, onUnmounted } from 'vue';`
		);
	}
	text = text.replace(
		/const \{ controlRef \} = useControlRefs<Id>\(\);/,
		'const { controls, controlRef } = useControlRefs<Id>();'
	);
	if (!text.includes('bridgeApi')) {
		const block = [
			'',
			'/** 控件级能力：schema 换候选项后要回写旧值（`write2` 只改值不派发 input）。 */',
			`const bridgeApi: ${job.iface} = {`,
			`\t${job.method}: (items) => {`,
			`\t\tcontrols['${job.control}']?.loadItems?.(items);`,
			`\t\tcontrols['${job.control}']?.write2?.(controls['${job.control}']?.read?.() as string);`,
			'\t}',
			'};',
			'',
			'onMounted(() => {',
			`\t${job.provide}(bridgeApi);`,
			`\tonUnmounted(() => ${job.reset}(bridgeApi));`,
			'});',
			''
		].join('\n');
		text = text.replace(/\n<\/script>/, `\n${block}</script>`);
	}
	writeFileSync(job.file, text);
	console.log(`✎ ${job.file}`);
}
