<template>
<WindowFrame id="setMovementSpeed" @confirm="onConfirm">
	<template #title><TitleBar>Set Movement Speed<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setMovementSpeed-actor" type="actor" @input="onActor" /><div class="text">Property</div><SelectBox id="setMovementSpeed-property" v-model="form.property" /><div class="text">Base Speed</div
			><NumberVar
				id="setMovementSpeed-base"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
				v-model="form.base"
			 /><div class="text">Speed Factor</div
			><NumberVar id="setMovementSpeed-factor" min="0" max="4" decimals="4" v-model="form.factor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetMovementSpeedCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setMovementSpeed-property')?.loadItems?.([
		{ name: 'Base Speed', value: 'base' },
		{ name: 'Speed Factor', value: 'factor' },
		{ name: 'Speed Factor (Temp)', value: 'factor-temp' }
	]);
	$('#setMovementSpeed-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'base', targets: [$('#setMovementSpeed-base')] },
			{
				case: ['factor', 'factor-temp'],
				targets: [$('#setMovementSpeed-factor')]
			}
		]);
});

</script>
