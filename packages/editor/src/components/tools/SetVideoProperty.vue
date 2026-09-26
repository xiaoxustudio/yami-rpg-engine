<template>
	<!-- 设置视频 - 属性 -->
	<WindowFrame id="setVideo-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setVideo-property.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setVideo-property-key.label') }}</div>
			<SelectBox
				id="setVideo-property-key"
				:ref="fieldRef('setVideo-property-key')"
				v-tip="t('components.setVideo-property-key.tip')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setVideo-property-video.label') }}</div>
			<CustomBox
				id="setVideo-property-video"
				:ref="fieldRef('setVideo-property-video')"
				type="file"
				filter="video"
				v-model="form.video"
			/>
			<div class="text">{{ t('components.setVideo-property-playbackRate.label') }}</div>
			<NumberVar
				id="setVideo-property-playbackRate"
				:ref="fieldRef('setVideo-property-playbackRate')"
				min="0"
				max="4"
				decimals="4"
				v-model="form.playbackRate"
			/>
			<div class="text">{{ t('components.setVideo-property-loop.label') }}</div>
			<SelectBox
				id="setVideo-property-loop"
				:ref="fieldRef('setVideo-property-loop')"
				v-model="form.loop"
			/>
			<div class="text">{{ t('components.setVideo-property-flip.label') }}</div>
			<SelectBox
				id="setVideo-property-flip"
				:ref="fieldRef('setVideo-property-flip')"
				v-model="form.flip"
			/>
			<div class="text">{{ t('components.setVideo-property-blend.label') }}</div>
			<SelectBox
				id="setVideo-property-blend"
				:ref="fieldRef('setVideo-property-blend')"
				v-model="form.blend"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { VideoProperty } from '@app/commands/property-window/set-video-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = VideoProperty.form;

const onConfirm = () => {
	VideoProperty.confirm?.(new Event('click'));
};

// 把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
VideoProperty.fields = fields;

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	VideoProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setVideo-property {
	width: 324px;
	height: 122px;
}

#setVideo-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setVideo-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
