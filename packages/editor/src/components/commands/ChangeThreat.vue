<template>
<WindowFrame id="changeThreat" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.changeThreat.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeThreat-actor" type="actor" @input="onActor" /><div class="text">Target</div><CustomBox id="changeThreat-target" type="actor" @input="onTarget" /><div class="text">Operation</div><SelectBox id="changeThreat-operation" v-model="form.operation" /><div class="text">Threat</div
			><NumberVar
				id="changeThreat-threat"
				min="0"
				max="1000000000"
				decimals="4"
				v-model="form.threat"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeThreatCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onTarget = (value: unknown) => {
	form.target = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.changeThreat');
	$('#changeThreat-operation')?.loadItems?.([
		{ name: get('increase') || 'Increase', value: 'increase' },
		{ name: get('decrease') || 'Decrease', value: 'decrease' }
	]);
});

</script>
