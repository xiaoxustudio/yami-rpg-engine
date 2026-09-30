<template>
	<PageManager id="layout-page-manager">
		<PaletteNode value="project" source="page">
			<ProjectPanel />
		</PaletteNode>
		<PaletteNode value="scene" source="page">
			<ScenePanel />
		</PaletteNode>
		<PaletteNode value="scene-object" source="page">
			<SceneObjectPanel />
		</PaletteNode>
		<PaletteNode value="ui" source="page">
			<UiPanel />
		</PaletteNode>
		<PaletteNode value="ui-element" source="page">
			<UiElementPanel />
		</PaletteNode>
		<PaletteNode value="animation" source="page">
			<AnimationPanel />
		</PaletteNode>
		<PaletteNode value="animation-motion" source="page">
			<AnimationMotionPanel />
		</PaletteNode>
		<PaletteNode value="animation-timeline" source="page">
			<AnimationTimelinePanel />
		</PaletteNode>
		<PaletteNode value="animation-easing" source="page">
			<AnimationEasingPanel />
		</PaletteNode>
		<PaletteNode value="particle" source="page">
			<ParticlePanel />
		</PaletteNode>
		<PaletteNode value="particle-layer" source="page">
			<ParticleLayerPanel />
		</PaletteNode>
		<PaletteNode value="inspector" source="page">
			<InspectorPanel />
		</PaletteNode>
	</PageManager>
</template>

<script setup lang="ts">
import PageManager from '@app/components/common/PageManager.vue';
import PaletteNode from '@app/components/layout/PaletteNode.vue';
import ProjectPanel from '@app/components/layout/ProjectPanel.vue';
import ScenePanel from '@app/components/layout/ScenePanel.vue';
import SceneObjectPanel from '@app/components/layout/SceneObjectPanel.vue';
import UiPanel from '@app/components/layout/UiPanel.vue';
import UiElementPanel from '@app/components/layout/UiElementPanel.vue';
import AnimationPanel from '@app/components/layout/AnimationPanel.vue';
import AnimationMotionPanel from '@app/components/layout/AnimationMotionPanel.vue';
import AnimationTimelinePanel from '@app/components/layout/AnimationTimelinePanel.vue';
import AnimationEasingPanel from '@app/components/layout/AnimationEasingPanel.vue';
import ParticlePanel from '@app/components/layout/ParticlePanel.vue';
import ParticleLayerPanel from '@app/components/layout/ParticleLayerPanel.vue';
import InspectorPanel from '@app/components/layout/InspectorPanel.vue';
</script>
