import { readFileSync, writeFileSync } from 'node:fs';

/**
 * UI 元素页三个组件：`registryRef(inspectorEls, id)` → `:ref="bind(id)"`（写进页面控件表）。
 * 页面额外建表 + provide + 登记给单例。
 */
const targets = [
	{
		file: 'packages/editor/src/components/inspector/UIImagePage.vue',
		isPage: true,
		ids: [
			'uiElement-events-group',
			'uiElement-events',
			'uiElement-scripts-group',
			'uiElement-scripts',
			'uiElement-parameter-pane'
		]
	},
	{
		file: 'packages/editor/src/components/inspector/ui-image/UIImageGeneralSection.vue',
		isPage: false,
		ids: ['uiElement-general-group', 'uiElement-name', 'uiElement-pointerEvents']
	},
	{
		file: 'packages/editor/src/components/inspector/ui-image/UIImageTransformSection.vue',
		isPage: false,
		ids: [
			'uiElement-transform-group',
			'uiElement-transform-anchorX',
			'uiElement-transform-anchorY',
			'uiElement-transform-x',
			'uiElement-transform-x2',
			'uiElement-transform-y',
			'uiElement-transform-y2',
			'uiElement-transform-width',
			'uiElement-transform-width2',
			'uiElement-transform-height',
			'uiElement-transform-height2',
			'uiElement-transform-rotation',
			'uiElement-transform-scaleX',
			'uiElement-transform-scaleY',
			'uiElement-transform-skewX',
			'uiElement-transform-skewY',
			'uiElement-transform-opacity'
		]
	}
];

for (const target of targets) {
	let text = readFileSync(target.file, 'utf8');
	for (const id of target.ids) {
		text = text.replace(`:ref="registryRef(inspectorEls, '${id}')"`, `:ref="bind('${id}')"`);
	}
	text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
	if (text.includes('registryElements')) {
		text = text.replace(
			"import { registryRef, registryElements } from '@app/utils/element-registry';\n",
			''
		);
	}
	if (!text.includes('ui-element-page-controls')) {
		const importBlock = target.isPage
			? [
					"import { inject, onMounted, onUnmounted, provide } from 'vue';",
					'import {',
					'\tUI_ELEMENT_CONTROLS_KEY,',
					'\tcreateControlBinder,',
					'\tprovideUiElementControls,',
					'\tresetUiElementControls,',
					'\ttype UiElementControlTable',
					"} from '@app/composables/ui-element-page-controls';"
				].join('\n')
			: [
					"import { inject, onMounted } from 'vue';",
					'import {',
					'\tUI_ELEMENT_CONTROLS_KEY,',
					'\tcreateControlBinder,',
					'\ttype UiElementControlTable',
					"} from '@app/composables/ui-element-page-controls';"
				].join('\n');
		text = text.replace(
			"import { useI18n } from 'vue-i18n';",
			`${importBlock}\nimport { useI18n } from 'vue-i18n';`
		);
	}

	const wiringPage = `
/** 页面建表：section 往里填，单例按 key 读。 */
const controls: UiElementControlTable = {};
provide(UI_ELEMENT_CONTROLS_KEY, controls);
const bind = createControlBinder(controls);
`;
	const wiringSection = `
/** section 往页面那张表里填自己那一半。 */
const controls = inject<UiElementControlTable>(UI_ELEMENT_CONTROLS_KEY, {});
const bind = createControlBinder(controls);
`;
	if (!text.includes('createControlBinder(controls)')) {
		text = text.replace(
			/(\n)(const \{ t \} = useI18n\(\);)/,
			`\n${target.isPage ? wiringPage : wiringSection}\n$2`
		);
	}

	if (target.isPage) {
		if (!text.includes('provideUiElementControls(controls)')) {
			text = text.replace(
				/onMounted\(\(\) => \{\n/,
				'onMounted(() => {\n\tprovideUiElementControls(controls);\n\tonUnmounted(() => resetUiElementControls(controls));\n'
			);
		}
	}

	writeFileSync(target.file, text);
	console.log(`✎ ${target.file}`);
}
