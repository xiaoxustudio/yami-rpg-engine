<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame ref="frame" id="tilemapGetter">
		<template #title><TitleBar>{{ t('components.tilemapGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.tilemapGetter-type.label') }}</div><SelectBox id="tilemapGetter-type" v-model="form.type" /> <div class="text">{{ t('components.tilemapGetter-presetId.label') }}</div
				><CustomBox
					id="tilemapGetter-presetId"
					type="preset-object"
					filter="tilemap"
					v-model="form.presetId"
				/>
				<div class="text">{{ t('components.tilemapGetter-variable.label') }}</div
				><CustomBox id="tilemapGetter-variable" type="variable" filter="object" v-model="form.variable" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const tilemapGetter = useTilemapGetterWindow();
const form = tilemapGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => tilemapGetter.onWindowClosed());
	}


});
</script>
