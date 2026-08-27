<template>
	<WindowFrame id="setState" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setState.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">State</div>
			<CustomBox id="setState-state" type="state" @input="onState" />
			<div class="text">Operation</div>
			<SelectBox id="setState-operation" v-model="form.operation" />
			<div class="text">Time</div>
			<NumberVar id="setState-time" min="0" max="36000000" unit="ms" v-model="form.time" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetStateCommandSchema();

const onState = (value: unknown) => {
	form.state = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setState-operation')?.loadItems?.([
		{ name: 'Set Time', value: 'set-time' },
		{ name: 'Increase Time', value: 'increase-time' },
		{ name: 'Decrease Time', value: 'decrease-time' }
	]);
});
</script>
