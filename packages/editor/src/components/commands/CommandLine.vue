<template>
	<WindowFrame id="commandLine" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.commandLine.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="commandLine-type"
				:ref="registryRef(fieldEls, 'commandLine-type')" v-model="form.type" />
			<div class="text">Key</div>
			<StringVar id="commandLine-key"
				:ref="registryRef(fieldEls, 'commandLine-key')" v-focus v-model="form.key" />
			<div class="text">Value</div>
			<StringVar id="commandLine-value"
				:ref="registryRef(fieldEls, 'commandLine-value')" v-model="form.value" />
			<div class="text">Variable</div>
			<CustomBox
				id="commandLine-variable"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('commandLine-type')?.loadItems?.([
		{ name: t('command.commandLine.get') || 'get', value: 'get' },
		{ name: t('command.commandLine.rm') || 'rm', value: 'rm' },
		{ name: t('command.commandLine.set') || 'set', value: 'set' },
		{ name: t('command.commandLine.has') || 'has', value: 'has' }
	]);
	fieldEls.get('commandLine-type')
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
