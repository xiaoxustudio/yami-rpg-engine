<template>
	<WindowFrame id="label" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.label.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.label-name.label') }}</div>
			<TextBox
				:label="t('components.label-name.label')"
				id="label-name"
				v-tip="t('components.label-name.tip')"
				v-focus
				v-model="name"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLabelCommandSchema } from '@app/composables/commands/useLabelCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, save } = useLabelCommandSchema();

const name = computed({
	get: () => form.name as string,
	set: (value) => {
		form.name = value;
	}
});

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#label {
	width: 324px;
	height: 98px;
}

#label-confirm {
	right: 108px;
	bottom: 10px;
}

#label-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
