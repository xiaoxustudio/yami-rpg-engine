<template>
	<WindowFrame id="createObject" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createObject.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createObject-presetId.label') }}</div>
			<CustomBox
				id="createObject-presetId"
				v-focus
				type="preset-object"
				filter="any"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.createObject-position.label') }}</div>
			<CustomBox id="createObject-position" type="position" v-model="form.position" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCreateObjectCommandSchema } from '@app/composables/commands/useCreateObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useCreateObjectCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#createObject {
	width: 324px;
	height: 122px;
}

#createObject-confirm {
	right: 108px;
	bottom: 10px;
}

#createObject-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
