<template>
	<WindowFrame ref="frame" id="angleGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.angleGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.angleGetter-type.label') }}</div>
			<SelectBox id="angleGetter-type" v-model="form.type" />
			<div class="text">{{ t('components.angleGetter-position-position.label') }}</div>
			<CustomBox id="angleGetter-position-position" type="position" v-model="form.position" />
			<div class="text">{{ t('components.angleGetter-common-degrees.label') }}</div>
			<NumberVar
				id="angleGetter-common-degrees"
				min="-36000"
				max="36000"
				decimals="4"
				unit="deg"
				v-model="form.degrees"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window.ts';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const angleGetter = useAngleGetterWindow();
const form = angleGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	AngleGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => angleGetter.onWindowClosed());
	}
});
</script>
