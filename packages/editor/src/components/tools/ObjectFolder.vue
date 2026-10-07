<template>
	<WindowFrame id="object-folder" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.object-folder.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.object-folder-tilemap.label') }}</div>
			<TextBox
				:label="t('components.object-folder-tilemap.label')"
				id="object-folder-tilemap"
				v-tip="t('components.object-folder-tilemap.tip')"
				v-model="ObjectFolder.form.tilemap"
			/>
			<div class="text">{{ t('components.object-folder-actor.label') }}</div>
			<TextBox
				:label="t('components.object-folder-actor.label')"
				id="object-folder-actor"
				v-tip="t('components.object-folder-actor.tip')"
				v-model="ObjectFolder.form.actor"
			/>
			<div class="text">{{ t('components.object-folder-region.label') }}</div>
			<TextBox
				:label="t('components.object-folder-region.label')"
				id="object-folder-region"
				v-tip="t('components.object-folder-region.tip')"
				v-model="ObjectFolder.form.region"
			/>
			<div class="text">{{ t('components.object-folder-light.label') }}</div>
			<TextBox
				:label="t('components.object-folder-light.label')"
				id="object-folder-light"
				v-tip="t('components.object-folder-light.tip')"
				v-model="ObjectFolder.form.light"
			/>
			<div class="text">{{ t('components.object-folder-animation.label') }}</div>
			<TextBox
				:label="t('components.object-folder-animation.label')"
				id="object-folder-animation"
				v-tip="t('components.object-folder-animation.tip')"
				v-model="ObjectFolder.form.animation"
			/>
			<div class="text">{{ t('components.object-folder-particle.label') }}</div>
			<TextBox
				:label="t('components.object-folder-particle.label')"
				id="object-folder-particle"
				v-tip="t('components.object-folder-particle.tip')"
				v-model="ObjectFolder.form.particle"
			/>
			<div class="text">{{ t('components.object-folder-parallax.label') }}</div>
			<TextBox
				:label="t('components.object-folder-parallax.label')"
				id="object-folder-parallax"
				v-tip="t('components.object-folder-parallax.tip')"
				v-model="ObjectFolder.form.parallax"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ObjectFolder } from '@app/scene/default-object-folder.ts';

const onConfirm = () => {
	ObjectFolder?.confirm?.(new Event('click'));
};
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();
</script>

<style>
#object-folder {
	width: 324px;
	height: 242px;
}

#object-folder-confirm {
	right: 108px;
	bottom: 10px;
}

#object-folder-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
