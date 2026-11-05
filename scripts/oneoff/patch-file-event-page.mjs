import { readFileSync, writeFileSync } from 'node:fs';

/** `FileEventPage.vue`：模板 ref + 页面桥；不再往 inspectorEls 登记、也不再 attachElementApi。 */
const file = 'packages/editor/src/components/inspector/FileEventPage.vue';
let text = readFileSync(file, 'utf8');

text = text.replace(`:ref="registryRef(inspectorEls, 'fileEvent-enabled')"`, 'ref="elEnabled"');
text = text.replace(`:ref="registryRef(inspectorEls, 'fileEvent-priority')"`, 'ref="elPriority"');
text = text.replace("import { inspectorEls } from '@app/inspector/element-registry.ts';\n", '');
text = text.replace(
	"import { registryRef, registerElement } from '@app/utils/element-registry';\n",
	"import {\n\tprovideFileEventPageBridge,\n\tresetFileEventPageBridge,\n\ttype FileEventPageBridge\n} from '@app/composables/file-event-page-bridge';\nimport { hide, show } from '@app/utils/element-utils';\n"
);
text = text.replace("import { attachElementApi } from '@app/utils/attach-element-api';\n", '');
text = text.replace(
	"import { onMounted, ref, watch } from 'vue';",
	"import { onMounted, onUnmounted, ref, watch } from 'vue';"
);

// 新的 refs
text = text.replace(
	'const elType = ref<InstanceType<typeof SelectBox> | null>(null);',
	[
		'const elType = ref<InstanceType<typeof SelectBox> | null>(null);',
		'const elEnabled = ref<InstanceType<typeof CheckBox> | null>(null);',
		'const elPriority = ref<InstanceType<typeof CheckBox> | null>(null);'
	].join('\n')
);

// onMounted：去掉注册与 attach，改成 provide 桥
text = text.replace(
	/\tonMounted\(\(\) => \{\n\tregisterElement\(inspectorEls, 'fileEvent-type', elType\.value\);\n\tregisterElement\(inspectorEls, 'fileEvent-parameters', elParameters\.value\);\n\tconst editor = Inspector\.fileEvent;\n\tif \(!editor\) return;\n\n\tconst el = inspectorEls\.get\('fileEvent-vue-mount'\);\n\tif \(el\) \{\n\t\tattachElementApi\(el, \{ sync \}\);\n\t\}\n/,
	[
		'\tonMounted(() => {',
		'\tconst editor = Inspector.fileEvent;',
		'\tif (!editor) return;',
		'',
		'\tprovideFileEventPageBridge(bridgeApi);',
		'\tonUnmounted(() => resetFileEventPageBridge(bridgeApi));',
		''
	].join('\n')
);

// 桥实现：插在 onMounted 之前
const bridgeImpl = `
/** 按事件类型开关某一行的显隐（控件 + 它左边的 \`.text\` 标签）。 */
const setRowVisible = (control: HTMLElement | null, visible: boolean): void => {
	const label = control?.previousElementSibling as HTMLElement | null;
	if (visible) {
		show(label);
		show(control);
	} else {
		hide(label);
		hide(control);
	}
};

const bridgeApi: FileEventPageBridge = {
	loadTypeItems: (items) => {
		elType.value?.loadItems(items);
	},
	sync: () => {
		sync();
	},
	clearParameters: () => {
		elParameters.value?.clear();
	},
	setEnabledVisible: (visible) => {
		setRowVisible(elEnabled.value?.root ?? null, visible);
	},
	setPriorityVisible: (visible) => {
		setRowVisible(elPriority.value?.root ?? null, visible);
	}
};

`;
text = text.replace(
	/(\n)(onMounted\(\(\) => \{\n\tconst editor = Inspector\.fileEvent;)/,
	`\n${bridgeImpl}$2`
);

writeFileSync(file, text);
console.log(
	/registryRef|registerElement|attachElementApi|inspectorEls/.test(text)
		? '! 仍有注册表/attach 引用'
		: '✓ FileEventPage.vue 已改'
);
