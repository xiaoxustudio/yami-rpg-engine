<template>
	<WindowFrame id="setCursor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setCursor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setCursor-image.label') }}</div>
			<CustomBox
				id="setCursor-image"
				v-tip="t('components.setCursor-image.tip')"
				v-focus
				type="file"
				filter="image"
				v-model="form.image"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetCursorCommandSchema } from '@app/composables/commands/useSetCursorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetCursorCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#setCursor {
	width: 324px;
	height: 98px;
}

#setCursor-confirm {
	right: 108px;
	bottom: 10px;
}

#setCursor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
