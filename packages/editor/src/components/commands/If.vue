<template>
	<WindowFrame id="if" :ref="registryRef(fieldEls, 'if')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-branches.label') }}</div>
			<ParamList
				id="if-branches"
				:ref="registryRef(fieldEls, 'if-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox
			id="if-else"
			:ref="registryRef(fieldEls, 'if-else')"
			v-model="form.else"
			class="standard"
			><div
				class="text"
				id="if-else-label"
				:ref="registryRef(fieldEls, 'if-else-label')"
				v-tip="t('components.if-else-label.tip')"
			>
				{{ t('components.if-else-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
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

const { t } = useI18n();

const { form, save, windowClosed } = useIfCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('if-branches')?.bind?.(IfBranch);
	on(fieldEls.get('if'), 'closed', () => windowClosed(new Event('closed')));
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
