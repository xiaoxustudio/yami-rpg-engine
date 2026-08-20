<template>
	<WindowFrame id="getObjectProperty" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.getObjectProperty.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="getObjectProperty-variable"
					type="variable"
					filter="object"
					@input="onVariable"
				/>
				<div class="text">getObjectProperty</div><ParamList id="getObjectProperty-list" />
				<div class="text">saveVariable</div
				><CustomBox
					id="getObjectProperty-save-variable"
					type="variable"
					filter="object"
					@input="onSaveVariable"
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

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onSaveVariable = (value: unknown) => {
	form.saveVariable = value;
};

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
