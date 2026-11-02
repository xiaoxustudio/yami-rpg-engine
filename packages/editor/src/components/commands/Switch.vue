<template>
	<WindowFrame id="switch" :ref="controlRef('switch')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-variable.label') }}</div>
			<CustomBox
				id="switch-variable"
				:ref="controlRef('switch-variable')"
				v-tip="t('components.switch-variable.tip')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.switch-branches.label') }}</div>
			<ParamList
				id="switch-branches"
				:ref="controlRef('switch-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox
			id="switch-default"
			:ref="controlRef('switch-default')"
			v-model="form.default"
			class="standard"
			><div
				class="text"
				id="switch-default-label"
				:ref="controlRef('switch-default-label')"
				v-tip="t('components.switch-default-label.tip')"
			>
				{{ t('components.switch-default-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
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
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'switch'
	| 'switch-branches'
	| 'switch-default'
	| 'switch-default-label'
	| 'switch-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, windowClosed } = useSwitchCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['switch-branches']?.bind?.(SwitchBranch);
	on(controls['switch'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
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
