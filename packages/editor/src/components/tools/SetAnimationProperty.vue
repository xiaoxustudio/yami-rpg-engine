<template>
		<WindowFrame id="setAnimation-property">
		<template #title><TitleBar>{{ t('components.setAnimation-property.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setAnimation-property-key.label') }}</div><SelectBox id="setAnimation-property-key" />
				<div class="text">{{ t('components.setAnimation-property-animation.label') }}</div
				><CustomBox
					id="setAnimation-property-animation"
					type="file"
					filter="animation"
				/>
				<div class="text">{{ t('components.setAnimation-property-actor.label') }}</div
				><CustomBox id="setAnimation-property-actor" type="actor" />
				<div class="text">{{ t('components.setAnimation-property-motion.label') }}</div
				><CustomBox id="setAnimation-property-motion" type="enum-string" />
				<div class="text">{{ t('components.setAnimation-property-angle.label') }}</div
				><NumberVar id="setAnimation-property-angle" min="0" max="360" unit="deg" />
				<div class="text">{{ t('components.setAnimation-property-frame.label') }}</div
				><NumberVar id="setAnimation-property-frame" min="0" max="10000" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
