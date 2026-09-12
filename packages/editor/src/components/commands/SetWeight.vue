<template>
	<WindowFrame id="setWeight" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setWeight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setWeight-actor"
				v-tip="t('components.setWeight-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Weight</div>
			<NumberVar
				id="setWeight-weight"
				v-tip="t('components.setWeight-weight.tip')"
				min="0"
				max="8"
				step="0.1"
				decimals="4"
				v-model="form.weight"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetWeightCommandSchema } from '@app/composables/commands/useSetWeightCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useSetWeightCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setWeight {
	width: 324px;
	height: 122px;
}

#setWeight-confirm {
	right: 108px;
	bottom: 10px;
}

#setWeight-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
