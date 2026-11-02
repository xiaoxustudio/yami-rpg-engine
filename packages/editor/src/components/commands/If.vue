<template>
	<WindowFrame id="if" :ref="controlRef('if')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-branches.label') }}</div>
			<ParamList
				id="if-branches"
				:ref="controlRef('if-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox id="if-else" :ref="controlRef('if-else')" v-model="form.else" class="standard"
			><div
				class="text"
				id="if-else-label"
				:ref="controlRef('if-else-label')"
				v-tip="t('components.if-else-label.tip')"
			>
				{{ t('components.if-else-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';

const IfBranch = useIfBranchSchema();
import { useIfCommandSchema } from '@app/composables/commands/useIfCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'if' | 'if-branches' | 'if-else' | 'if-else-label';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, windowClosed } = useIfCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['if-branches']?.bind?.(IfBranch);
	on(controls['if'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#if {
	width: 324px;
	height: 180px;
}

#if-branches {
	height: 102px;
}

#if-else {
	position: absolute;
	left: 10px;
	bottom: 10px;
}

#if-confirm {
	right: 108px;
	bottom: 10px;
}

#if-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
