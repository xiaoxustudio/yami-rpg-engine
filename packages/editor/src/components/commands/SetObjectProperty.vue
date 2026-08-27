<template>
	<WindowFrame id="setObjectProperty" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="setObjectProperty-variable"
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">setObjectProperty</div>
			<ParamList id="setObjectProperty-list" v-model="form.list" />
			<div class="text">valueVariable</div>
			<CustomBox
				id="setObjectProperty-value-variable"
				type="variable"
				filter="all"
				v-model="form.valueVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useSetObjectPropertyCommandSchema,
	IndexBind
} from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setObjectProperty-list')?.bind?.(IndexBind);
	$('#setObjectProperty')?.on?.('closed', () => {
		clear($('#setObjectProperty-list'));
	});
});
</script>
