<template>
	<WindowFrame ref="frame" id="regionGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.regionGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.regionGetter-type.label') }}</div>
			<SelectBox id="regionGetter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.regionGetter-presetId.label') }}</div>
			<CustomBox
				id="regionGetter-presetId"
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
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const regionGetter = useRegionGetterWindow();
const form = regionGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	RegionGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => regionGetter.onWindowClosed());
	}
});
</script>
