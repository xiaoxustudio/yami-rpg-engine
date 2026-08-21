<template>
		<WindowFrame id="setImage-property">
		<template #title><TitleBar>{{ t('components.setImage-property.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setImage-property-key.label') }}</div><SelectBox id="setImage-property-key" v-model="form.key" />
				<div class="text">{{ t('components.setImage-property-image.label') }}</div
				><CustomBox id="setImage-property-image" type="file" filter="image" v-model="form.image" />
				<div class="text">{{ t('components.setImage-property-display.label') }}</div><SelectBox id="setImage-property-display" v-model="form.display" />
				<div class="text">{{ t('components.setImage-property-flip.label') }}</div><SelectBox id="setImage-property-flip" v-model="form.flip" /> <div class="text">{{ t('components.setImage-property-blend.label') }}</div
				><SelectBox id="setImage-property-blend" v-model="form.blend" /> <div class="text">{{ t('components.setImage-property-shiftX.label') }}</div
				><NumberVar
					id="setImage-property-shiftX"
					min="-10000"
					max="10000"
					unit="px"
					v-model="form.shiftX"
				/>
				<div class="text">{{ t('components.setImage-property-shiftY.label') }}</div
				><NumberVar
					id="setImage-property-shiftY"
					min="-10000"
					max="10000"
					unit="px"
					v-model="form.shiftY"
				/>
				<div class="text">{{ t('components.setImage-property-clip-0.label') }}</div
				><NumberVar id="setImage-property-clip-0" min="0" max="10000" unit="px" v-model="form['clip-0']" />
				<div class="text">{{ t('components.setImage-property-clip-1.label') }}</div
				><NumberVar id="setImage-property-clip-1" min="0" max="10000" unit="px" v-model="form['clip-1']" />
				<div class="text">{{ t('components.setImage-property-clip-2.label') }}</div
				><NumberVar id="setImage-property-clip-2" min="0" max="10000" unit="px" v-model="form['clip-2']" />
				<div class="text">{{ t('components.setImage-property-clip-3.label') }}</div
				><NumberVar id="setImage-property-clip-3" min="0" max="10000" unit="px" v-model="form['clip-3']" />
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
import { ImageProperty } from '@app/commands/property-window/set-image-property-window';

const { t } = useI18n();

const form = ImageProperty.form;

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
