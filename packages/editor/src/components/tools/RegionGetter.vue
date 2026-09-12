<template>
	<WindowFrame ref="frame" id="regionGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.regionGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.regionGetter-type.label') }}</div>
			<SelectBox id="regionGetter-type"
				v-tip="t('components.regionGetter-type.tip')"
				:ref="fieldRef('regionGetter-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.regionGetter-presetId.label') }}</div>
			<CustomBox
				id="regionGetter-presetId"
				v-tip="t('components.regionGetter-presetId.tip')"
				:ref="fieldRef('regionGetter-presetId')"
				v-focus
				v-model="form.presetId"
				type="preset-object"
				filter="region"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RegionGetter } from '@app/commands/accessors/region-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const regionGetter = useRegionGetterWindow();
const form = regionGetter.form;

// P5b 批次 2：把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
RegionGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	RegionGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => regionGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#regionGetter {
	width: 324px;
	height: 122px;
}

#regionGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#regionGetter-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
