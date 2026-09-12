<template>
	<WindowFrame id="switch"
				:ref="registryRef(fieldEls, 'switch')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox id="switch-variable"
				v-tip="t('components.switch-variable.tip')" v-focus type="variable" filter="all" v-model="form.variable" />
			<div class="text">Branches</div>
			<ParamList id="switch-branches"
				:ref="registryRef(fieldEls, 'switch-branches')" v-focus v-model="form.branches" />
		</div>
		<CheckBox id="switch-default" v-model="form.default" class="standard"
			><div class="text" id="switch-default-label"
				v-tip="t('components.switch-default-label.tip')">Default</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';

const SwitchBranch = useSwitchBranchSchema();
import { useSwitchCommandSchema } from '@app/composables/commands/useSwitchCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save, windowClosed } = useSwitchCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('switch-branches')?.bind?.(SwitchBranch);
	on(fieldEls.get('switch'), 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#switch {
	width: 324px;
	height: 204px;
}

#switch-branches {
	height: 102px;
}

#switch-default {
	position: absolute;
	left: 10px;
	bottom: 10px;
}

#switch-confirm {
	right: 108px;
	bottom: 10px;
}

#switch-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
