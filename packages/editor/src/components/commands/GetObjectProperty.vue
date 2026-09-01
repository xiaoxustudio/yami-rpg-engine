<template>
	<WindowFrame id="getObjectProperty" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="getObjectProperty-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">getObjectProperty</div>
			<ParamList id="getObjectProperty-list" v-focus v-model="form.properties" />
			<div class="text">saveVariable</div>
			<CustomBox
				id="getObjectProperty-save-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.saveVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetObjectPropertyCommandSchema } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { IndexBind } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useGetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#getObjectProperty-list')?.bind?.(IndexBind);
	$('#getObjectProperty')?.on?.('closed', () => {
		clear($('#getObjectProperty-list'));
	});
});
</script>
