<template>
	<WindowFrame id="addAnimationComponent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.addAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="addAnimationComponent-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="addAnimationComponent-animationId"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">Motion</div>
			<SelectBox id="addAnimationComponent-motion" v-model="form.motion" />
			<div class="text">Rotatable</div>
			<SelectBox id="addAnimationComponent-rotatable" v-model="form.rotatable" />
			<div class="text">Sync Angle</div>
			<SelectBox id="addAnimationComponent-syncAngle" v-model="form.syncAngle" />
			<div class="text">Priority</div>
			<NumberBox
				id="addAnimationComponent-priority"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">Offset Y</div>
			<NumberBox
				id="addAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
				v-model="offsetY"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAddAnimationComponentCommandSchema } from '@app/composables/commands/useAddAnimationComponentCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useAddAnimationComponentCommandSchema();

const priority = computed({
	get: () => form.priority as number | string,
	set: (value) => {
		form.priority = value;
	}
});
const offsetY = computed({
	get: () => form.offsetY as number | string,
	set: (value) => {
		form.offsetY = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#addAnimationComponent-rotatable')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#addAnimationComponent-syncAngle')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#addAnimationComponent {
	width: 324px;
	height: 242px;
}

#addAnimationComponent-confirm {
	right: 108px;
	bottom: 10px;
}

#addAnimationComponent-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
