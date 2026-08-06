<template>
	<PageManager id="workspace-page-manager">
		<div class="page-frame" id="home" value="home">
			<div class="box" id="home-content">
				<div class="text" id="home-title">YAMI RPG EDITOR (Open Yami)</div>
				<div class="text" id="home-version"></div>
				<div class="box" id="home-start-list">
					<div class="item home-list-label" id="home-start-label">Start</div>
					<div class="item home-start-item" id="home-start-new" value="new">New Project</div>
					<div class="item home-start-item" id="home-start-open" value="open">Open Project</div>
				</div>
				<div class="box" id="home-recent-list" tabindex="-1">
					<div class="item home-list-label" id="home-recent-label">Recent</div>
					<div class="item home-recent-item" value="0"></div>
					<div class="item home-recent-item" value="1"></div>
					<div class="item home-recent-item" value="2"></div>
				</div>
			</div>
		</div>
		<div class="page-frame" value="directory">
			<div class="box" id="layout-content">
				<NavBar id="layout-nav">
			<div class="nav-item" value="project"><div class="nav-icon">&#xf07b;</div><div class="nav-text" id="nav-project">Project</div></div>
			<div class="nav-item" value="scene"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-scene">Scene</div></div>
			<div class="nav-item" value="scene-object"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-scene-object">Object</div></div>
			<div class="nav-item" value="ui"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-ui">UI</div></div>
			<div class="nav-item" value="ui-element"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-ui-element">Element</div></div>
			<div class="nav-item" value="animation"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-animation">Animation</div></div>
			<div class="nav-item" value="animation-motion"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-animation-motion">Motion</div></div>
			<div class="nav-item" value="animation-timeline"><div class="nav-icon">&#xf017;</div><div class="nav-text" id="nav-animation-timeline">Timeline</div></div>
			<div class="nav-item" value="animation-easing"><div class="nav-icon">&#xf201;</div><div class="nav-text" id="nav-animation-easing">Easing</div></div>
			<div class="nav-item" value="particle"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-particle">Particle</div></div>
			<div class="nav-item" value="particle-layer"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-particle-layer">Layer</div></div>
			<div class="nav-item" value="inspector"><div class="nav-icon">&#xf05a;</div><div class="nav-text" id="nav-inspector">Inspector</div></div>
		</NavBar>
		<PageManager id="layout-page-manager">
			<div class="page-frame" id="project" value="project">
				<div class="file-browser" id="project-browser"></div>
			</div>
			<div class="page-frame" id="scene" value="scene">
				<div class="box" id="scene-head" @pointerdown="onSceneHeadPointerdown">
					<div class="box" id="scene-head-start" @pointerdown="onSceneSwitchPointerdown">
						<div class="item toolbar-item" id="scene-switch-grid" value="grid"></div>
						<div class="item toolbar-item" id="scene-switch-light" value="light"></div>
						<div class="item toolbar-item" id="scene-switch-animation" value="animation"></div>
						<div class="item toolbar-item" id="scene-switch-settings" value="settings" hotkey="Alt+S"></div>
					</div>
					<div class="box" id="scene-head-center">
						<div class="box" id="scene-layer" @pointerdown="onSceneLayerPointerdown">
							<div class="item toolbar-item" id="scene-layer-object" value="object" hotkey="`"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-1" value="1" hotkey="1"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-2" value="2" hotkey="2"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-3" value="3" hotkey="3"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-4" value="4" hotkey="4"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-5" value="5" hotkey="5"></div>
							<div class="item toolbar-item hidden" id="scene-layer-tilemap-6" value="6" hotkey="6"></div>
							<div class="item toolbar-item" id="scene-layer-terrain" value="terrain" hotkey="`"></div>
						</div>
						<div class="box" id="scene-brush" @pointerdown="onSceneBrushPointerdown">
							<div class="item toolbar-item" id="scene-brush-eraser" value="eraser" hotkey="Q"></div>
							<div class="item toolbar-item" id="scene-brush-pencil" value="pencil" hotkey="E"></div>
							<div class="item toolbar-item" id="scene-brush-rect" value="rect" hotkey="R"></div>
							<div class="item toolbar-item" id="scene-brush-oval" value="oval" hotkey="T"></div>
							<div class="item toolbar-item" id="scene-brush-fill" value="fill" hotkey="Y"></div>
						</div>
					</div>
					<div class="box" id="scene-head-end">
						<SliderBox
							id="scene-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
							@input="onSceneZoomInput"
							@focus="onSceneZoomFocus"
						></SliderBox>
					</div>
				</div>
				<div class="box" id="scene-body">
					<div
						class="box"
						id="scene-screen"
						tabindex="-1"
						@keydown="onSceneScreenKeydown"
						@wheel="onSceneScreenWheel"
					>
						<MarqueeArea
							id="scene-marquee"
							@pointerdown="onSceneMarqueePointerdown"
							@doubleclick="onSceneMarqueeDoubleclick"
						></MarqueeArea>
					</div>
					<div class="text" id="scene-info"></div>
				</div>
			</div>
			<div class="page-frame" id="scene-object" value="scene-object">
				<div class="box" id="scene-list-head">
					<TextBox id="scene-searcher" name="search"></TextBox>
				</div>
				<TreeList
					id="scene-list"
					padded
					@select="onSceneListSelect"
					@record="onSceneListRecord"
					@popup="onSceneListPopup"
					@open="onSceneListOpen"
					@change="onSceneListChange"
				></TreeList>
			</div>
			<div class="page-frame" id="ui" value="ui">
				<div class="box" id="ui-head" @pointerdown="onUiHeadPointerdown">
					<div class="box" id="ui-head-start" @pointerdown="onUiSwitchPointerdown">
						<div class="item toolbar-item" id="ui-switch-settings" value="settings"></div>
					</div>
					<div class="box" id="ui-head-center" @pointerdown="onUiShortcutPointerdown">
						<div class="item toolbar-item" id="ui-element-image" value="image"></div>
						<div class="item toolbar-item" id="ui-element-text" value="text"></div>
						<div class="item toolbar-item" id="ui-element-textbox" value="textbox"></div>
						<div class="item toolbar-item" id="ui-element-dialogbox" value="dialogbox"></div>
						<div class="item toolbar-item" id="ui-element-progressbar" value="progressbar"></div>
						<div class="item toolbar-item" id="ui-element-button" value="button"></div>
						<div class="item toolbar-item" id="ui-element-animation" value="animation"></div>
						<div class="item toolbar-item" id="ui-element-video" value="video"></div>
						<div class="item toolbar-item" id="ui-element-window" value="window"></div>
						<div class="item toolbar-item" id="ui-element-container" value="container"></div>
						<div class="item toolbar-item" id="ui-element-reference" value="reference"></div>
					</div>
					<div class="box" id="ui-head-end">
						<SliderBox
							id="ui-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
							@input="onUiZoomInput"
							@focus="onUiZoomFocus"
						></SliderBox>
					</div>
				</div>
				<div class="box" id="ui-body">
					<div
						class="box"
						id="ui-screen"
						tabindex="-1"
						@keydown="onUiScreenKeydown"
						@wheel="onUiScreenWheel"
					>
						<MarqueeArea
							id="ui-marquee"
							@pointerdown="onUiMarqueePointerdown"
							@doubleclick="onUiMarqueeDoubleclick"
						></MarqueeArea>
					</div>
				</div>
			</div>
			<div class="page-frame" id="ui-element" value="ui-element">
				<div class="box" id="ui-list-head">
					<TextBox id="ui-searcher" name="search"></TextBox>
				</div>
				<TreeList
					id="ui-list"
					padded
					@select="onUiListSelect"
					@record="onUiListRecord"
					@popup="onUiListPopup"
					@open="onUiListOpen"
					@change="onUiListChange"
				></TreeList>
			</div>
			<div class="page-frame" id="animation" value="animation">
				<div class="box" id="animation-head" @pointerdown="onAnimationHeadPointerdown">
					<div class="box" id="animation-head-start" @pointerdown="onAnimationSwitchPointerdown">
						<div class="item toolbar-item" id="animation-switch-mark" value="mark"></div>
						<div class="item toolbar-item" id="animation-switch-onionskin" value="onionskin" hotkey="O"></div>
						<div class="item toolbar-item" id="animation-switch-mirror" value="mirror" hotkey="M"></div>
						<div class="item toolbar-item" id="animation-switch-settings" value="settings"></div>
					</div>
					<div class="box" id="animation-head-center">
						<NumberBox id="animation-speed" min="0" max="4" step="0.05" decimals="2"><div class="text label">speed:</div></NumberBox>
					</div>
					<div class="box" id="animation-head-end">
						<SliderBox
							id="animation-zoom"
							name="zoom-0-6"
							min="0"
							max="6"
							hotkey="-/+"
							active-wheel
							@input="onAnimationZoomInput"
							@focus="onAnimationZoomFocus"
						></SliderBox>
					</div>
				</div>
				<div class="box" id="animation-body">
					<div
						class="box"
						id="animation-screen"
						tabindex="-1"
						@keydown="onAnimationScreenKeydown"
						@wheel="onAnimationScreenWheel"
					>
						<MarqueeArea
							id="animation-marquee"
							@pointerdown="onAnimationMarqueePointerdown"
							@doubleclick="onAnimationMarqueeDoubleclick"
						></MarqueeArea>
					</div>
					<div class="box" id="animation-dirList"></div>
				</div>
			</div>
			<div class="page-frame" id="animation-motion" value="animation-motion">
				<div class="box" id="animation-list-head">
					<TextBox id="animation-searcher" name="search"></TextBox>
				</div>
				<TreeList
					id="animation-list"
					padded
					@select="onAnimationListSelect"
					@record="onAnimationListRecord"
					@open="onAnimationListOpen"
					@popup="onAnimationListPopup"
					@change="onAnimationListChange"
				></TreeList>
			</div>
			<div class="page-frame" id="animation-timeline" value="animation-timeline">
				<div class="box" id="animation-timeline-head">
					<div
						class="box"
						id="animation-timeline-toolbar"
						@pointerdown="onTimelineToolbarPointerdown"
					>
						<div class="item toolbar-item" id="animation-timeline-previousKey" value="previousKey" hotkey="Z"></div>
						<div class="item toolbar-item" id="animation-timeline-previous" value="previous" hotkey="Q"></div>
						<div class="item toolbar-item" id="animation-timeline-play" value="play" hotkey="R"></div>
						<div class="item toolbar-item" id="animation-timeline-next" value="next" hotkey="E"></div>
						<div class="item toolbar-item" id="animation-timeline-nextKey" value="nextKey" hotkey="X"></div>
						<div class="item toolbar-item" id="animation-timeline-loop" value="loop"></div>
					</div>
					<div class="box" id="animation-timeline-ruler-outer">
						<div class="box" id="animation-timeline-ruler-inner"></div>
					</div>
				</div>
				<TreeList
					id="animation-layer-list"
					@select="onLayerListSelect"
					@record="onLayerListRecord"
					@popup="onLayerListPopup"
					@change="onLayerListChange"
				></TreeList>
				<div class="box" id="animation-timeline-list-outer" tabindex="0">
					<div class="box" id="animation-timeline-list-inner"></div>
					<div class="box" id="animation-timeline-cursor"></div>
					<div class="box" id="animation-timeline-marquee"></div>
					<div class="box" id="animation-timeline-marquee-shift"></div>
				</div>
				<div class="box" id="animation-timeline-pointer-area-outer">
					<div class="box" id="animation-timeline-pointer-area-inner">
						<div class="box" id="animation-timeline-pointer"></div>
					</div>
				</div>
			</div>
			<div class="page-frame" id="animation-easing" value="animation-easing">
				<div class="box" id="animation-easing-head">
					<div class="item toolbar-item" id="animation-easing-settings" value="bezier"></div>
					<SelectBox
					id="animation-easing-id"
					@write="onEasingIdWrite"
					@input="onEasingIdInput"
				></SelectBox>
				</div>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</div>
			<div class="page-frame" id="particle" value="particle">
				<div class="box" id="particle-head" @pointerdown="onParticleHeadPointerdown">
					<div class="box" id="particle-head-start" @pointerdown="onParticleViewPointerdown">
						<div class="item toolbar-item" id="particle-view-wireframe" value="wireframe"></div>
						<div class="item toolbar-item" id="particle-view-anchor" value="anchor"></div>
					</div>
					<div class="box" id="particle-head-center">
						<div class="box" id="particle-control" @pointerdown="onParticleControlPointerdown">
							<div class="item toolbar-item" id="particle-control-restart" value="restart" hotkey="R"></div>
							<div class="item toolbar-item" id="particle-control-pause" value="pause" hotkey="P"></div>
						</div>
						<NumberBox id="particle-speed" min="0" max="4" step="0.05" decimals="2"><div class="text label">speed:</div></NumberBox>
					</div>
					<div class="box" id="particle-head-end">
						<SliderBox
							id="particle-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
							@input="onParticleZoomInput"
							@focus="onParticleZoomFocus"
						></SliderBox>
					</div>
				</div>
				<div class="box" id="particle-body">
					<div
						class="box"
						id="particle-screen"
						tabindex="-1"
						@keydown="onParticleScreenKeydown"
						@wheel="onParticleScreenWheel"
					>
						<MarqueeArea
							id="particle-marquee"
							@pointerdown="onParticleMarqueePointerdown"
						></MarqueeArea>
					</div>
					<div class="text" id="particle-info"></div>
				</div>
			</div>
			<div class="page-frame" id="particle-layer" value="particle-layer">
				<TreeList id="particle-list" padded></TreeList>
			</div>
			<div class="page-frame" id="inspector" value="inspector">
				<PageManager id="inspector-page-manager" tabindex="-1">
					<div class="page-frame" value="fileScene" id="fileScene-vue-mount"></div>
					<div class="page-frame" value="fileUI" id="fileUI-vue-mount"></div>
					<div class="page-frame" value="fileAnimation" id="fileAnimation-vue-mount"></div>
					<div class="page-frame" id="fileTileset" value="fileTileset"></div>
					<div class="page-frame" value="fileActor" id="fileActor-vue-mount"></div>
					<div class="page-frame" value="fileSkill" id="fileSkill-vue-mount"></div>
					<div class="page-frame" value="fileTrigger" id="fileTrigger-vue-mount"></div>
					<div class="page-frame" value="fileItem" id="fileItem-vue-mount"></div>
					<div class="page-frame" value="fileEquipment" id="fileEquipment-vue-mount"></div>
					<div class="page-frame" value="fileState" id="fileState-vue-mount"></div>
					<div class="page-frame" value="fileEvent" id="fileEvent-vue-mount"></div>
					<div class="page-frame" id="fileImage" value="fileImage"></div>
					<div class="page-frame" id="fileAudio" value="fileAudio"></div>
					<div class="page-frame" id="fileVideo" value="fileVideo"></div>
					<div class="page-frame" id="fileFont" value="fileFont"></div>
					<div class="page-frame" id="fileScript" value="fileScript"></div>
					<div class="page-frame" value="sceneActor" id="sceneActor-vue-mount"></div>
					<div class="page-frame" value="sceneRegion" id="sceneRegion-vue-mount"></div>
					<div class="page-frame" value="sceneLight" id="sceneLight-vue-mount"></div>
					<div class="page-frame" value="sceneAnimation" id="sceneAnimation-vue-mount"></div>
					<div class="page-frame" value="sceneParticle" id="sceneParticle-vue-mount"></div>
					<div class="page-frame" value="sceneParallax" id="sceneParallax-vue-mount"></div>
					<div class="page-frame" value="sceneTilemap" id="sceneTilemap-vue-mount"></div>
					<div class="page-frame" value="uiImage" id="uiImage-vue-mount"></div>
					<div class="page-frame" value="uiText" id="uiText-vue-mount"></div>
					<div class="page-frame" value="uiTextBox" id="uiTextBox-vue-mount"></div>
					<div class="page-frame" value="uiDialogBox" id="uiDialogBox-vue-mount"></div>
					<div class="page-frame" value="uiProgressBar" id="uiProgressBar-vue-mount"></div>
					<div class="page-frame" value="uiButton" id="uiButton-vue-mount"></div>
					<div class="page-frame" value="uiAnimation" id="uiAnimation-vue-mount"></div>
					<div class="page-frame" value="uiVideo" id="uiVideo-vue-mount"></div>
					<div class="page-frame" value="uiWindow" id="uiWindow-vue-mount"></div>
					<div class="page-frame" value="uiContainer"></div>
					<div class="page-frame" value="uiReference" id="uiReference-vue-mount"></div>
					<div class="page-frame" value="animMotion" id="animMotion-vue-mount"></div>
					<div class="page-frame" value="animJointFrame" id="animJointFrame-vue-mount"></div>
					<div class="page-frame" value="animSpriteLayer" id="animSpriteLayer-vue-mount"></div>
					<div class="page-frame" value="animSpriteFrame" id="animSpriteFrame-vue-mount"></div>
					<div class="page-frame" value="animParticleLayer" id="animParticleLayer-vue-mount"></div>
					<div class="page-frame" value="animParticleFrame" id="animParticleFrame-vue-mount"></div>
					<div class="page-frame" value="animSoundLayer" id="animSoundLayer-vue-mount"></div>
					<div class="page-frame" value="animSoundFrame" id="animSoundFrame-vue-mount"></div>
					<div class="page-frame" value="particleLayer" id="particleLayer-vue-mount"></div>
					</PageManager>
			</div>
		</PageManager>
</div>
</div>
	<div class="page-frame" value="scene"></div>
	<div class="page-frame" value="ui"></div>
	<div class="page-frame" value="animation"></div>
	<div class="page-frame" value="particle"></div>
	</PageManager>
</template>

<script setup lang="ts">
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import PageManager from '@app/components/common/PageManager.vue';
import NavBar from '@app/components/common/NavBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const onSceneHeadPointerdown = (event: PointerEvent) => {
	(window as any).Scene?.headPointerdown?.(event);
};
const onSceneSwitchPointerdown = (event: PointerEvent) => {
	(window as any).Scene?.switchPointerdown?.(event);
};
const onSceneLayerPointerdown = (event: PointerEvent) => {
	(window as any).Scene?.layerPointerdown?.(event);
};
const onSceneBrushPointerdown = (event: PointerEvent) => {
	(window as any).Scene?.brushPointerdown?.(event);
};
const onSceneZoomInput = (value: number) => {
	(window as any).Scene?.setZoom?.(value);
};
const onSceneZoomFocus = () => {
	(window as any).Scene?.zoomFocus?.();
};
const onSceneScreenKeydown = (event: KeyboardEvent) => {
	(window as any).Scene?.screenKeydown?.(event);
};
const onSceneScreenWheel = (event: WheelEvent) => {
	(window as any).Scene?.screenWheel?.(event);
};
const onSceneMarqueePointerdown = (event: PointerEvent) => {
	(window as any).Scene?.marqueePointerdown?.(event);
};
const onSceneMarqueeDoubleclick = (event: PointerEvent) => {
	(window as any).Scene?.marqueeDoubleclick?.(event);
};
const onEasingIdWrite = (value: any) => {
	(window as any).Curve?.easingIdWrite?.({ value });
};
const onEasingIdInput = (value: any) => {
	(window as any).Curve?.easingIdInput?.({ value });
};
const onUiListChange = (event: any) => {
	(window as any).UI?.listChange?.(event);
};
const onAnimationListSelect = (event: any) => {
	(window as any).Animation?.listSelect?.(event);
};
const onAnimationListRecord = (event: any) => {
	(window as any).Animation?.listRecord?.(event);
};
const onAnimationListOpen = (event: any) => {
	(window as any).Animation?.listOpen?.(event);
};
const onAnimationListPopup = (event: any) => {
	(window as any).Animation?.listPopup?.(event);
};
const onAnimationListChange = (event: any) => {
	(window as any).Animation?.listChange?.(event);
};
const onLayerListSelect = (event: any) => {
	(window as any).Animation?.layerListSelect?.(event);
};
const onLayerListRecord = (event: any) => {
	(window as any).Animation?.layerListRecord?.(event);
};
const onLayerListPopup = (event: any) => {
	(window as any).Animation?.layerListPopup?.(event);
};
const onLayerListChange = (event: any) => {
	(window as any).Animation?.layerListChange?.(event);
};
const onTimelineToolbarPointerdown = (event: PointerEvent) => {
	(window as any).Animation?.timelineToolbarPointerdown?.(event);
};
const onUiHeadPointerdown = (event: PointerEvent) => {
	(window as any).UI?.headPointerdown?.(event);
};
const onUiSwitchPointerdown = (event: PointerEvent) => {
	(window as any).UI?.switchPointerdown?.(event);
};
const onUiShortcutPointerdown = (event: PointerEvent) => {
	(window as any).UI?.shortcutPointerdown?.(event);
};
const onUiZoomInput = (value: number) => {
	(window as any).UI?.setZoom?.(value);
};
const onUiZoomFocus = () => {
	(window as any).UI?.zoomFocus?.();
};
const onUiScreenKeydown = (event: KeyboardEvent) => {
	(window as any).UI?.screenKeydown?.(event);
};
const onUiScreenWheel = (event: WheelEvent) => {
	(window as any).UI?.screenWheel?.(event);
};
const onUiMarqueePointerdown = (event: PointerEvent) => {
	(window as any).UI?.marqueePointerdown?.(event);
};
const onUiMarqueeDoubleclick = (event: PointerEvent) => {
	(window as any).UI?.marqueeDoubleclick?.(event);
};
const onAnimationHeadPointerdown = (event: PointerEvent) => {
	(window as any).Animation?.headPointerdown?.(event);
};
const onAnimationSwitchPointerdown = (event: PointerEvent) => {
	(window as any).Animation?.switchPointerdown?.(event);
};
const onAnimationZoomInput = (value: number) => {
	(window as any).Animation?.setZoom?.(value);
};
const onAnimationZoomFocus = () => {
	(window as any).Animation?.zoomFocus?.();
};
const onAnimationScreenKeydown = (event: KeyboardEvent) => {
	(window as any).Animation?.screenKeydown?.(event);
};
const onAnimationScreenWheel = (event: WheelEvent) => {
	(window as any).Animation?.screenWheel?.(event);
};
const onAnimationMarqueePointerdown = (event: PointerEvent) => {
	(window as any).Animation?.marqueePointerdown?.(event);
};
const onAnimationMarqueeDoubleclick = (event: PointerEvent) => {
	(window as any).Animation?.marqueeDoubleclick?.(event);
};
const onParticleHeadPointerdown = (event: PointerEvent) => {
	(window as any).Particle?.headPointerdown?.(event);
};
const onParticleViewPointerdown = (event: PointerEvent) => {
	(window as any).Particle?.viewPointerdown?.(event);
};
const onParticleControlPointerdown = (event: PointerEvent) => {
	(window as any).Particle?.controlPointerdown?.(event);
};
const onParticleZoomInput = (value: number) => {
	(window as any).Particle?.setZoom?.(value);
};
const onParticleZoomFocus = () => {
	(window as any).Particle?.zoomFocus?.();
};
const onParticleScreenKeydown = (event: KeyboardEvent) => {
	(window as any).Particle?.screenKeydown?.(event);
};
const onParticleScreenWheel = (event: WheelEvent) => {
	(window as any).Particle?.screenWheel?.(event);
};
const onParticleMarqueePointerdown = (event: PointerEvent) => {
	(window as any).Particle?.marqueePointerdown?.(event);
};
const onSceneListSelect = (event: any) => {
	(window as any).Scene?.listSelect?.(event);
};
const onSceneListRecord = (event: any) => {
	(window as any).Scene?.listRecord?.(event);
};
const onSceneListPopup = (event: any) => {
	(window as any).Scene?.listPopup?.(event);
};
const onSceneListOpen = (event: any) => {
	(window as any).Scene?.listOpen?.(event);
};
const onSceneListChange = (event: any) => {
	(window as any).Scene?.listChange?.(event);
};
const onUiListSelect = (event: any) => {
	(window as any).UI?.listSelect?.(event);
};
const onUiListRecord = (event: any) => {
	(window as any).UI?.listRecord?.(event);
};
const onUiListPopup = (event: any) => {
	(window as any).UI?.listPopup?.(event);
};
const onUiListOpen = (event: any) => {
	(window as any).UI?.listOpen?.(event);
};
</script>
