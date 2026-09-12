<template>
	<WindowFrame id="translateActor"
				:ref="registryRef(fieldEls, 'translateActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.translateActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="translateActor-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Angle</div>
			<CustomBox id="translateActor-angle" type="angle" v-model="form.angle" />
			<div class="text">Distance</div>
			<NumberVar
				id="translateActor-distance"
				v-focus
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">Easing</div>
			<SelectBox id="translateActor-easingId"
				:ref="registryRef(fieldEls, 'translateActor-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberVar
				id="translateActor-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="translateActor-wait"
				:ref="registryRef(fieldEls, 'translateActor-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateActorCommandSchema } from '@app/composables/commands/useTranslateActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useTranslateActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('translateActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('translateActor')?.on?.('open', () => {
		fieldEls.get('translateActor-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#translateActor {
	width: 324px;
	height: 218px;
}

#translateActor-confirm {
	right: 108px;
	bottom: 10px;
}

#translateActor-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
