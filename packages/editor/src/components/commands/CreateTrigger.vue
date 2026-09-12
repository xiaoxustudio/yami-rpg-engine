<template>
	<WindowFrame id="createTrigger" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createTrigger.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<FileVar
				id="createTrigger-triggerId"
				v-tip="t('components.createTrigger-triggerId.tip')"
				v-focus
				type="file"
				filter="trigger"
				v-model="form.triggerId"
			/>
			<div class="text">Caster</div>
			<CustomBox id="createTrigger-caster"
				v-tip="t('components.createTrigger-caster.tip')" type="actor" v-model="form.caster" />
			<div class="text">Origin</div>
			<CustomBox id="createTrigger-origin"
				v-tip="t('components.createTrigger-origin.tip')" type="position" v-model="form.origin" />
			<div class="text">Angle</div>
			<CustomBox id="createTrigger-angle"
				v-tip="t('components.createTrigger-angle.tip')" type="angle" v-model="form.angle" />
			<div class="text">Distance</div>
			<NumberVar
				id="createTrigger-distance"
				v-tip="t('components.createTrigger-distance.tip')"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">Scale</div>
			<NumberVar
				id="createTrigger-scale"
				v-tip="t('components.createTrigger-scale.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.scale"
			/>
			<div class="text">Global Speed</div>
			<NumberVar
				id="createTrigger-timeScale"
				v-tip="t('components.createTrigger-timeScale.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.timeScale"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCreateTriggerCommandSchema } from '@app/composables/commands/useCreateTriggerCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useCreateTriggerCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#createTrigger {
	width: 346px;
	height: 242px;
}

#createTrigger-confirm {
	right: 108px;
	bottom: 10px;
}

#createTrigger-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
