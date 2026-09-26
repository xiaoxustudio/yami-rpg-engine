<template>
	<WindowFrame id="switch" :ref="registryRef(fieldEls, 'switch')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-variable.label') }}</div>
			<CustomBox
				id="switch-variable"
				:ref="registryRef(fieldEls, 'switch-variable')"
				v-tip="t('components.switch-variable.tip')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.switch-branches.label') }}</div>
			<ParamList
				id="switch-branches"
				:ref="registryRef(fieldEls, 'switch-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox
			id="switch-default"
			:ref="registryRef(fieldEls, 'switch-default')"
			v-model="form.default"
			class="standard"
			><div
				class="text"
				id="switch-default-label"
				:ref="registryRef(fieldEls, 'switch-default-label')"
				v-tip="t('components.switch-default-label.tip')"
			>
				{{ t('components.switch-default-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
