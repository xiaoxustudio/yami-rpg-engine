import { readFileSync, writeFileSync } from 'node:fs';

/** 页面：去掉 `attachElementApi(fileActor-vue-mount, { sync })`，改走桥。 */
const pageFile = 'packages/editor/src/components/inspector/FileActorPage.vue';
let page = readFileSync(pageFile, 'utf8');
page = page.replace("import { inspectorEls } from '@app/inspector/element-registry.ts';\n", '');
page = page.replace(
	"import { attachElementApi } from '@app/utils/attach-element-api';\n",
	"import {\n\tprovideFileActorPage,\n\tresetFileActorPage,\n\ttype FileActorPageApi\n} from '@app/composables/file-actor-page-bridge';\n"
);
page = page.replace(
	/onMounted\(\(\) => \{\n\tconst editor = Inspector\.fileActor;\n\tif \(!editor\) return;\n\tconst el = inspectorEls\.get\('fileActor-vue-mount'\);\n\tif \(el\) \{\n\t\tattachElementApi\(el, \{ sync \}\);\n\t\}\n\tsync\(\);\n\}\);/,
	[
		'const bridgeApi: FileActorPageApi = { sync };',
		'',
		'onMounted(() => {',
		'\tconst editor = Inspector.fileActor;',
		'\tif (!editor) return;',
		'\tprovideFileActorPage(bridgeApi);',
		'\tonUnmounted(() => resetFileActorPage(bridgeApi));',
		'\tsync();',
		'});'
	].join('\n')
);
if (!page.includes('onUnmounted')) {
	page = page.replace(
		"import { onMounted, provide } from 'vue';",
		"import { onMounted, onUnmounted, provide } from 'vue';"
	);
}
writeFileSync(pageFile, page);
console.log(
	/attachElementApi|inspectorEls/.test(page) ? '! 页面仍有 attach/注册表' : '✓ FileActorPage 已改'
);

/** 动作用属性 section：两个下拉改模板 ref + 桥。 */
const sectionFile =
	'packages/editor/src/components/inspector/file-actor/FileActorPropertiesSection.vue';
let section = readFileSync(sectionFile, 'utf8');
section = section.replace(
	`:ref="registryRef(inspectorEls, 'fileActor-idleMotion')"`,
	'ref="idleMotionRef"'
);
section = section.replace(
	`:ref="registryRef(inspectorEls, 'fileActor-moveMotion')"`,
	'ref="moveMotionRef"'
);
section = section.replace(
	"import { inspectorEls } from '@app/inspector/element-registry.ts';\n",
	''
);
section = section.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
if (!section.includes('file-actor-page-bridge')) {
	section = section.replace(
		"import { useI18n } from 'vue-i18n';",
		"import { useI18n } from 'vue-i18n';\nimport {\n\tprovideFileActorMotion,\n\tresetFileActorMotion,\n\ttype FileActorMotionApi\n} from '@app/composables/file-actor-page-bridge';"
	);
}
const wiring = `
/** 「待机 / 移动动作」两个下拉：换动画后由单例经桥要求刷新。 */
const idleMotionRef = ref<InstanceType<typeof SelectBox> | null>(null);
const moveMotionRef = ref<InstanceType<typeof SelectBox> | null>(null);

const bridgeApi: FileActorMotionApi = {
	reloadMotions: (items) => {
		idleMotionRef.value?.loadItems(items);
		moveMotionRef.value?.loadItems(items);
		const prev = idleMotionRef.value?.read?.();
		idleMotionRef.value?.write2?.(prev);
		moveMotionRef.value?.write2?.(prev);
	}
};

onMounted(() => {
	provideFileActorMotion(bridgeApi);
	onUnmounted(() => resetFileActorMotion(bridgeApi));
});
`;
if (!section.includes('provideFileActorMotion(bridgeApi)')) {
	if (!/import \{[^}]*onMounted/.test(section)) {
		section = section.replace(
			"import { useI18n } from 'vue-i18n';",
			"import { onMounted, onUnmounted, ref } from 'vue';\nimport { useI18n } from 'vue-i18n';"
		);
	}
	section = section.replace(/\n<\/script>/, `\n${wiring}</script>`);
}
writeFileSync(sectionFile, section);
console.log(
	/registryRef|inspectorEls/.test(section)
		? '! section 仍有注册表'
		: '✓ FileActorPropertiesSection 已改'
);
