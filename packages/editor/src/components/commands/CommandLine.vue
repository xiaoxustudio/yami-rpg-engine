<template>
	<WindowFrame id="commandLine" :ref="registryRef(fieldEls, 'commandLine')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.commandLine.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.commandLine-type.label') }}</div>
			<SelectBox
				id="commandLine-type"
				:ref="registryRef(fieldEls, 'commandLine-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.commandLine-key.label') }}</div>
			<StringVar
				id="commandLine-key"
				v-tip="t('components.commandLine-key.tip')"
				:ref="registryRef(fieldEls, 'commandLine-key')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.commandLine-value.label') }}</div>
			<StringVar
				id="commandLine-value"
				v-tip="t('components.commandLine-value.tip')"
				:ref="registryRef(fieldEls, 'commandLine-value')"
				v-model="form.value"
			/>
			<div class="text">{{ t('components.commandLine-variable.label') }}</div>
			<CustomBox
				id="commandLine-variable"
				v-tip="t('components.commandLine-variable.tip')"
				:ref="registryRef(fieldEls, 'commandLine-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommandLineCommandSchema } from '@app/composables/commands/useCommandLineCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCommandLineCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'commandLine-type',
		['get', 'rm', 'set', 'has'],
		(items) => fieldEls.get('commandLine-type')?.loadItems?.(items),
		{
			get: 'command.commandLine.get',
			rm: 'command.commandLine.rm',
			set: 'command.commandLine.set',
			has: 'command.commandLine.has'
		}
	);
	fieldEls
		.get('commandLine-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'get',
				targets: [fieldEls.get('commandLine-key'), fieldEls.get('commandLine-variable')]
			},
			{
				case: 'rm',
				targets: [fieldEls.get('commandLine-key'), fieldEls.get('commandLine-value')]
			},
			{
				case: 'set',
				targets: [fieldEls.get('commandLine-key'), fieldEls.get('commandLine-value')]
			},
			{
				case: 'has',
				targets: [fieldEls.get('commandLine-key'), fieldEls.get('commandLine-variable')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#commandLine {
	width: 324px;
	height: 146px;
}

#commandLine-confirm {
	right: 108px;
	bottom: 10px;
}

#commandLine-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
