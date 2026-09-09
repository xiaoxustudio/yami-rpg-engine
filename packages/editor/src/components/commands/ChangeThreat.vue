<template>
	<WindowFrame id="changeThreat" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeThreat.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeThreat-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Target</div>
			<CustomBox id="changeThreat-target" type="actor" v-model="form.target" />
			<div class="text">Operation</div>
			<SelectBox id="changeThreat-operation" v-model="form.operation" />
			<div class="text">Threat</div>
			<NumberVar
				id="changeThreat-threat"
				min="0"
				max="1000000000"
				decimals="4"
				v-model="form.threat"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeThreatCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changeThreat-operation')?.loadItems?.([
		{ name: t('command.changeThreat.increase') || 'Increase', value: 'increase' },
		{ name: t('command.changeThreat.decrease') || 'Decrease', value: 'decrease' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#changeThreat {
	width: 324px;
	height: 170px;
}

#changeThreat-confirm {
	right: 108px;
	bottom: 10px;
}

#changeThreat-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
