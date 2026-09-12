<template>
	<PageManager id="workspace-page-manager">
		<div class="page-frame" id="home" value="home">
			<div class="box" id="home-content">
				<div class="text" id="home-title">YAMI RPG EDITOR (Open Yami)</div>
				<div class="text" id="home-version"></div>
				<div class="box" id="home-start-list" @click="onHomeStartClick">
					<div class="item home-list-label" id="home-start-label">Start</div>
					<div class="item home-start-item" id="home-start-new" value="new">
						New Project
					</div>
					<div class="item home-start-item" id="home-start-open" value="open">
						Open Project
					</div>
				</div>
				<HomeRecentList />
			</div>
		</div>
		<div class="page-frame" value="directory">
			<div class="box" id="layout-content">
			<LayoutPaletteHost>
				<NavBar id="layout-nav" ref="paletteNavEl">
					<PaletteNode value="project" source="tab">
					<div class="nav-item" value="project">
						<div class="nav-icon">&#xf07b;</div>
						<div class="nav-text" id="nav-project">Project</div>
					</div>
					</PaletteNode>
					<PaletteNode value="scene" source="tab">
					<div class="nav-item" value="scene">
						<div class="nav-icon">&#xf26c;</div>
						<div class="nav-text" id="nav-scene">Scene</div>
					</div>
					</PaletteNode>
					<PaletteNode value="scene-object" source="tab">
					<div class="nav-item" value="scene-object">
						<div class="nav-icon">&#xf1b2;</div>
						<div class="nav-text" id="nav-scene-object">Object</div>
					</div>
					</PaletteNode>
					<PaletteNode value="ui" source="tab">
					<div class="nav-item" value="ui">
						<div class="nav-icon">&#xf26c;</div>
						<div class="nav-text" id="nav-ui">UI</div>
					</div>
					</PaletteNode>
					<PaletteNode value="ui-element" source="tab">
					<div class="nav-item" value="ui-element">
						<div class="nav-icon">&#xf1b2;</div>
						<div class="nav-text" id="nav-ui-element">Element</div>
					</div>
					</PaletteNode>
					<PaletteNode value="animation" source="tab">
					<div class="nav-item" value="animation">
						<div class="nav-icon">&#xf26c;</div>
						<div class="nav-text" id="nav-animation">Animation</div>
					</div>
					</PaletteNode>
					<PaletteNode value="animation-motion" source="tab">
					<div class="nav-item" value="animation-motion">
						<div class="nav-icon">&#xf1b2;</div>
						<div class="nav-text" id="nav-animation-motion">Motion</div>
					</div>
					</PaletteNode>
					<PaletteNode value="animation-timeline" source="tab">
					<div class="nav-item" value="animation-timeline">
						<div class="nav-icon">&#xf017;</div>
						<div class="nav-text" id="nav-animation-timeline">Timeline</div>
					</div>
					</PaletteNode>
					<PaletteNode value="animation-easing" source="tab">
					<div class="nav-item" value="animation-easing">
						<div class="nav-icon">&#xf201;</div>
						<div class="nav-text" id="nav-animation-easing">Easing</div>
					</div>
					</PaletteNode>
					<PaletteNode value="particle" source="tab">
					<div class="nav-item" value="particle">
						<div class="nav-icon">&#xf26c;</div>
						<div class="nav-text" id="nav-particle">Particle</div>
					</div>
					</PaletteNode>
					<PaletteNode value="particle-layer" source="tab">
					<div class="nav-item" value="particle-layer">
						<div class="nav-icon">&#xf1b2;</div>
						<div class="nav-text" id="nav-particle-layer">Layer</div>
					</div>
					</PaletteNode>
					<PaletteNode value="inspector" source="tab">
					<div class="nav-item" value="inspector">
						<div class="nav-icon">&#xf05a;</div>
						<div class="nav-text" id="nav-inspector">Inspector</div>
					</div>
					</PaletteNode>
				</NavBar>
				<PageManager id="layout-page-manager" ref="paletteManagerEl">
					<PaletteNode value="project" source="page">
					<div class="page-frame" id="project" value="project">
						<div class="file-browser" id="project-browser"></div>
					</div>
					</PaletteNode>
					<PaletteNode value="scene" source="page">
					<div class="page-frame" id="scene" value="scene">
						<div class="box" id="scene-head" @pointerdown="onSceneHeadPointerdown">
							<div
								class="box"
								id="scene-head-start"
								@pointerdown="onSceneSwitchPointerdown"
							>
								<div
									class="item toolbar-item"
									id="scene-switch-grid"
									value="grid"
								></div>
								<div
									class="item toolbar-item"
									id="scene-switch-light"
									value="light"
								></div>
								<div
									class="item toolbar-item"
									id="scene-switch-animation"
									value="animation"
								></div>
								<div
									class="item toolbar-item"
									id="scene-switch-settings"
				:ref="registryRef(inspectorEls, 'scene-switch-settings')"
									value="settings"
									hotkey="Alt+S"
								></div>
							</div>
							<div class="box" id="scene-head-center">
								<div
									class="box"
									id="scene-layer"
									@pointerdown="onSceneLayerPointerdown"
								>
									<div
										class="item toolbar-item"
										id="scene-layer-object"
										value="object"
										hotkey="`"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-1"
										value="1"
										hotkey="1"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-2"
										value="2"
										hotkey="2"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-3"
										value="3"
										hotkey="3"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-4"
										value="4"
										hotkey="4"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-5"
										value="5"
										hotkey="5"
									></div>
									<div
										class="item toolbar-item hidden"
										id="scene-layer-tilemap-6"
										value="6"
										hotkey="6"
									></div>
									<div
										class="item toolbar-item"
										id="scene-layer-terrain"
										value="terrain"
										hotkey="`"
									></div>
								</div>
								<div
									class="box"
									id="scene-brush"
									@pointerdown="onSceneBrushPointerdown"
								>
									<div
										class="item toolbar-item"
										id="scene-brush-eraser"
										value="eraser"
										hotkey="Q"
									></div>
									<div
										class="item toolbar-item"
										id="scene-brush-pencil"
										value="pencil"
										hotkey="E"
									></div>
									<div
										class="item toolbar-item"
										id="scene-brush-rect"
										value="rect"
										hotkey="R"
									></div>
									<div
										class="item toolbar-item"
										id="scene-brush-oval"
										value="oval"
										hotkey="T"
									></div>
									<div
										class="item toolbar-item"
										id="scene-brush-fill"
										value="fill"
										hotkey="Y"
									></div>
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
					</PaletteNode>
					<PaletteNode value="scene-object" source="page">
					<div class="page-frame" id="scene-object" value="scene-object">
						<div class="box" id="scene-list-head">
							<TextBox id="scene-searcher" name="search"></TextBox>
						</div>
						<TreeList
							id="scene-list"
							padded
							:node-extras="sceneNodeExtras"
							:node-icon-renderer="sceneNodeIcon"
							@select="onSceneListSelect"
							@record="onSceneListRecord"
							@popup="onSceneListPopup"
							@open="onSceneListOpen"
							@change="onSceneListChange"
						></TreeList>
					</div>
					</PaletteNode>
					<PaletteNode value="ui" source="page">
					<div class="page-frame" id="ui" value="ui">
						<div class="box" id="ui-head" @pointerdown="onUiHeadPointerdown">
							<div
								class="box"
								id="ui-head-start"
								@pointerdown="onUiSwitchPointerdown"
							>
								<div
									class="item toolbar-item"
									id="ui-switch-settings"
				:ref="registryRef(inspectorEls, 'ui-switch-settings')"
									value="settings"
								></div>
							</div>
							<div
								class="box"
								id="ui-head-center"
								@pointerdown="onUiShortcutPointerdown"
							>
								<div
									class="item toolbar-item"
									id="ui-element-image"
									value="image"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-text"
									value="text"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-textbox"
									value="textbox"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-dialogbox"
									value="dialogbox"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-progressbar"
									value="progressbar"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-button"
									value="button"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-animation"
									value="animation"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-video"
									value="video"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-window"
									value="window"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-container"
									value="container"
								></div>
								<div
									class="item toolbar-item"
									id="ui-element-reference"
									value="reference"
								></div>
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
					</PaletteNode>
					<PaletteNode value="ui-element" source="page">
					<div class="page-frame" id="ui-element" value="ui-element">
						<div class="box" id="ui-list-head">
							<TextBox id="ui-searcher" name="search"></TextBox>
						</div>
						<TreeList
							id="ui-list"
							padded
							:node-extras="uiNodeExtras"
							:node-icon-renderer="uiNodeIcon"
							@select="onUiListSelect"
							@record="onUiListRecord"
							@popup="onUiListPopup"
							@open="onUiListOpen"
							@change="onUiListChange"
						></TreeList>
					</div>
					</PaletteNode>
					<PaletteNode value="animation" source="page">
					<div class="page-frame" id="animation" value="animation">
						<div
							class="box"
							id="animation-head"
							@pointerdown="onAnimationHeadPointerdown"
						>
							<div
								class="box"
								id="animation-head-start"
								@pointerdown="onAnimationSwitchPointerdown"
							>
								<div
									class="item toolbar-item"
									id="animation-switch-mark"
									value="mark"
									:class="{ selected: animation.showMark }"
								></div>
								<div
									class="item toolbar-item"
									id="animation-switch-onionskin"
									value="onionskin"
									hotkey="O"
									:class="{ selected: animation.showOnionskin }"
								></div>
								<div
									class="item toolbar-item"
									id="animation-switch-mirror"
									value="mirror"
									hotkey="M"
									:class="{ selected: animation.mirror }"
								></div>
								<div
									class="item toolbar-item"
									id="animation-switch-settings"
				:ref="registryRef(inspectorEls, 'animation-switch-settings')"
									value="settings"
								></div>
							</div>
							<div class="box" id="animation-head-center">
								<NumberBox
									id="animation-speed"
									min="0"
									max="4"
									step="0.05"
									decimals="2"
									v-model="speedModel"
									><div class="text label">speed:</div></NumberBox
								>
							</div>
							<div class="box" id="animation-head-end">
								<SliderBox
									id="animation-zoom"
									name="zoom-0-6"
									min="0"
									max="6"
									hotkey="-/+"
									active-wheel
									v-model="zoomModel"
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
							<div
								ref="dirListEl"
								class="box"
								id="animation-dirList"
								v-show="dirs.length > 1"
							>
								<div
									class="anim-dir"
									v-for="(dir, index) in dirs"
									:key="index"
									:class="{ selected: index === direction }"
									@pointerdown="onDirPointerdown(index)"
								>
									{{ dir }}
								</div>
							</div>
						</div>
					</div>
					</PaletteNode>
					<PaletteNode value="animation-motion" source="page">
					<div class="page-frame" id="animation-motion" value="animation-motion">
						<div class="box" id="animation-list-head">
							<TextBox id="animation-searcher" name="search"></TextBox>
						</div>
						<TreeList
							id="animation-list"
							padded
							:node-extras="animationNodeExtras"
							:node-icon-renderer="animationNodeIcon"
							@select="onAnimationListSelect"
							@record="onAnimationListRecord"
							@open="onAnimationListOpen"
							@popup="onAnimationListPopup"
							@change="onAnimationListChange"
						></TreeList>
					</div>
					</PaletteNode>
					<PaletteNode value="animation-timeline" source="page">
					<div class="page-frame" id="animation-timeline" value="animation-timeline">
						<div class="box" id="animation-timeline-head">
							<div
								class="box"
								id="animation-timeline-toolbar"
								@pointerdown="onTimelineToolbarPointerdown"
							>
								<div
									class="item toolbar-item"
									id="animation-timeline-previousKey"
									value="previousKey"
									hotkey="Z"
								></div>
								<div
									class="item toolbar-item"
									id="animation-timeline-previous"
									value="previous"
									hotkey="Q"
								></div>
								<div
									class="item toolbar-item"
									id="animation-timeline-play"
									value="play"
									hotkey="R"
									:class="{ playing: animation.playing }"
								></div>
								<div
									class="item toolbar-item"
									id="animation-timeline-next"
									value="next"
									hotkey="E"
								></div>
								<div
									class="item toolbar-item"
									id="animation-timeline-nextKey"
									value="nextKey"
									hotkey="X"
								></div>
								<div
									class="item toolbar-item"
									id="animation-timeline-loop"
									value="loop"
									:class="{ selected: animation.loop }"
								></div>
							</div>
							<div class="box" id="animation-timeline-ruler-outer">
								<div class="box" id="animation-timeline-ruler-inner"></div>
							</div>
						</div>
						<TreeList
							id="animation-layer-list"
							:node-extras="layerNodeExtras"
							:node-icon-renderer="layerNodeIcon"
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
					</PaletteNode>
					<PaletteNode value="animation-easing" source="page">
					<div class="page-frame" id="animation-easing" value="animation-easing">
						<div class="box" id="animation-easing-head">
							<div
								class="item toolbar-item"
								id="animation-easing-settings"
								value="bezier"
							></div>
							<SelectBox
								id="animation-easing-id"
								@write="onEasingIdWrite"
								@input="onEasingIdInput"
							></SelectBox>
						</div>
						<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
					</div>
					</PaletteNode>
					<PaletteNode value="particle" source="page">
					<div class="page-frame" id="particle" value="particle">
						<div
							class="box"
							id="particle-head"
							@pointerdown="onParticleHeadPointerdown"
						>
							<div
								class="box"
								id="particle-head-start"
								@pointerdown="onParticleViewPointerdown"
							>
								<div
									class="item toolbar-item"
									id="particle-view-wireframe"
									value="wireframe"
								></div>
								<div
									class="item toolbar-item"
									id="particle-view-anchor"
									value="anchor"
								></div>
							</div>
							<div class="box" id="particle-head-center">
								<div
									class="box"
									id="particle-control"
									@pointerdown="onParticleControlPointerdown"
								>
									<div
										class="item toolbar-item"
										id="particle-control-restart"
										value="restart"
										hotkey="R"
									></div>
									<div
										class="item toolbar-item"
										id="particle-control-pause"
										value="pause"
										hotkey="P"
									></div>
								</div>
								<NumberBox
									id="particle-speed"
									min="0"
									max="4"
									step="0.05"
									decimals="2"
									><div class="text label">speed:</div></NumberBox
								>
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
					</PaletteNode>
					<PaletteNode value="particle-layer" source="page">
					<div class="page-frame" id="particle-layer" value="particle-layer">
						<TreeList
							id="particle-list"
							padded
							:node-extras="particleNodeExtras"
							:node-icon-renderer="particleNodeIcon"
						></TreeList>
					</div>
					</PaletteNode>
					<PaletteNode value="inspector" source="page">
					<div class="page-frame" id="inspector"
				:ref="registryRef(inspectorEls, 'inspector')" value="inspector">
						<PageManager id="inspector-page-manager"
				:ref="registryRef(inspectorEls, 'inspector-page-manager')" tabindex="-1">
							<div
								class="page-frame"
								value="fileScene"
								id="fileScene-vue-mount"
				:ref="registryRef(inspectorEls, 'fileScene-vue-mount')"
							></div>
							<div class="page-frame" value="fileUI" id="fileUI-vue-mount"
				:ref="registryRef(inspectorEls, 'fileUI-vue-mount')"></div>
							<div
								class="page-frame"
								value="fileAnimation"
								id="fileAnimation-vue-mount"
							></div>
							<div class="page-frame" id="fileTileset"
				:ref="registryRef(inspectorEls, 'fileTileset')" value="fileTileset"></div>
							<div
								class="page-frame"
								value="fileActor"
								id="fileActor-vue-mount"
				:ref="registryRef(inspectorEls, 'fileActor-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="fileSkill"
								id="fileSkill-vue-mount"
							></div>
							<div
								class="page-frame"
								value="fileTrigger"
								id="fileTrigger-vue-mount"
				:ref="registryRef(inspectorEls, 'fileTrigger-vue-mount')"
							></div>
							<div class="page-frame" value="fileItem" id="fileItem-vue-mount"></div>
							<div
								class="page-frame"
								value="fileEquipment"
								id="fileEquipment-vue-mount"
							></div>
							<div
								class="page-frame"
								value="fileState"
								id="fileState-vue-mount"
							></div>
							<div
								class="page-frame"
								value="fileEvent"
								id="fileEvent-vue-mount"
				:ref="registryRef(inspectorEls, 'fileEvent-vue-mount')"
							></div>
							<div class="page-frame" id="fileImage"
				:ref="registryRef(inspectorEls, 'fileImage')" value="fileImage"></div>
							<div class="page-frame" id="fileAudio"
				:ref="registryRef(inspectorEls, 'fileAudio')" value="fileAudio"></div>
							<div class="page-frame" id="fileVideo"
				:ref="registryRef(inspectorEls, 'fileVideo')" value="fileVideo"></div>
							<div class="page-frame" id="fileFont"
				:ref="registryRef(inspectorEls, 'fileFont')" value="fileFont"></div>
							<div class="page-frame" id="fileScript"
				:ref="registryRef(inspectorEls, 'fileScript')" value="fileScript"></div>
							<div
								class="page-frame"
								value="sceneActor"
								id="sceneActor-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneActor-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneRegion"
								id="sceneRegion-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneRegion-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneLight"
								id="sceneLight-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneLight-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneAnimation"
								id="sceneAnimation-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneAnimation-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneParticle"
								id="sceneParticle-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneParticle-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneParallax"
								id="sceneParallax-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneParallax-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="sceneTilemap"
								id="sceneTilemap-vue-mount"
				:ref="registryRef(inspectorEls, 'sceneTilemap-vue-mount')"
							></div>
							<div class="page-frame" value="uiImage" id="uiImage-vue-mount"
				:ref="registryRef(inspectorEls, 'uiImage-vue-mount')"></div>
							<div class="page-frame" value="uiText" id="uiText-vue-mount"
				:ref="registryRef(inspectorEls, 'uiText-vue-mount')"></div>
							<div
								class="page-frame"
								value="uiTextBox"
								id="uiTextBox-vue-mount"
				:ref="registryRef(inspectorEls, 'uiTextBox-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="uiDialogBox"
								id="uiDialogBox-vue-mount"
				:ref="registryRef(inspectorEls, 'uiDialogBox-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="uiProgressBar"
								id="uiProgressBar-vue-mount"
				:ref="registryRef(inspectorEls, 'uiProgressBar-vue-mount')"
							></div>
							<div class="page-frame" value="uiButton" id="uiButton-vue-mount"
				:ref="registryRef(inspectorEls, 'uiButton-vue-mount')"></div>
							<div
								class="page-frame"
								value="uiAnimation"
								id="uiAnimation-vue-mount"
				:ref="registryRef(inspectorEls, 'uiAnimation-vue-mount')"
							></div>
							<div class="page-frame" value="uiVideo" id="uiVideo-vue-mount"
				:ref="registryRef(inspectorEls, 'uiVideo-vue-mount')"></div>
							<div class="page-frame" value="uiWindow" id="uiWindow-vue-mount"
				:ref="registryRef(inspectorEls, 'uiWindow-vue-mount')"></div>
							<div
								class="page-frame"
								value="uiContainer"
								id="uiContainer-vue-mount"
							></div>
							<div
								class="page-frame"
								value="uiReference"
								id="uiReference-vue-mount"
				:ref="registryRef(inspectorEls, 'uiReference-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animMotion"
								id="animMotion-vue-mount"
				:ref="registryRef(inspectorEls, 'animMotion-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animJointFrame"
								id="animJointFrame-vue-mount"
				:ref="registryRef(inspectorEls, 'animJointFrame-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animSpriteLayer"
								id="animSpriteLayer-vue-mount"
				:ref="registryRef(inspectorEls, 'animSpriteLayer-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animSpriteFrame"
								id="animSpriteFrame-vue-mount"
				:ref="registryRef(inspectorEls, 'animSpriteFrame-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animParticleLayer"
								id="animParticleLayer-vue-mount"
				:ref="registryRef(inspectorEls, 'animParticleLayer-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animParticleFrame"
								id="animParticleFrame-vue-mount"
				:ref="registryRef(inspectorEls, 'animParticleFrame-vue-mount')"
							></div>
							<div
								class="page-frame"
								value="animSoundLayer"
								id="animSoundLayer-vue-mount"
							></div>
							<div
								class="page-frame"
								value="animSoundFrame"
								id="animSoundFrame-vue-mount"
							></div>
							<div
								class="page-frame"
								value="particleLayer"
								id="particleLayer-vue-mount"
				:ref="registryRef(inspectorEls, 'particleLayer-vue-mount')"
							></div>
						</PageManager>
					</div>
					</PaletteNode>
				</PageManager>
			</LayoutPaletteHost>
			</div>
		</div>
		<div class="page-frame" value="scene"></div>
		<div class="page-frame" value="ui"></div>
		<div class="page-frame" value="animation"></div>
		<div class="page-frame" value="particle"></div>
	</PageManager>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, type VNode } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import PageManager from '@app/components/common/PageManager.vue';
import NavBar from '@app/components/common/NavBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import HomeRecentList from '@app/components/layout/HomeRecentList.vue';
import LayoutPaletteHost from '@app/components/layout/LayoutPaletteHost.vue';
import PaletteNode from '@app/components/layout/PaletteNode.vue';
import { getAnimationStore } from '@app/stores/animation';
import { getSceneStore } from '@app/stores/scene';
import { getParticleStore } from '@app/stores/particle';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import { registerLayoutItems } from '@app/engine/layout/layout.ts';
import { collectPaletteItems } from '@app/components/layout/palette-items';
import { getLazyWindow } from '@app/tools/window-registry';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { setIconClip } from '@app/utils/icon-clip';

const loadCluster = () => import('@app/tools/window-cluster');
const Scene = getLazyWindow('scene', () => loadCluster().then((m) => m.Scene));
const UI = getLazyWindow('ui', () => loadCluster().then((m) => m.UI));
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));
const Particle = getLazyWindow('particle', () => loadCluster().then((m) => m.Particle));
const Inspector = getLazyWindow('inspector', () => loadCluster().then((m) => m.Inspector));
const Curve = getLazyWindow('curve', () => loadCluster().then((m) => m.Curve));
const Home = getLazyWindow('home', () => loadCluster().then((m) => m.Home));

interface SceneExtrasNode {
	class?: string;
	enabled?: boolean;
	conditions?: unknown[];
	events?: unknown[];
	scripts?: unknown[];
	hidden?: boolean;
	locked?: boolean;
	parent?: SceneExtrasNode;
	teamId?: string;
	color?: string;
	red?: number;
	green?: number;
	blue?: number;
	image?: string;
}

interface UiExtrasNode {
	class?: string;
	enabled?: boolean;
	hidden?: boolean;
	locked?: boolean;
	instance?: UiExtrasNode;
	events?: unknown[];
	scripts?: unknown[];
	conditions?: unknown[];
	prefabId?: string;
	presetId?: string;
}

interface LayerExtrasNode {
	hidden?: boolean;
	locked?: boolean;
}

// oxlint-disable-next-line no-explicit-any
type ExtrasListElement = HTMLElement & { [k: string]: any };

const onSceneVisibilityPointerdown =
	(item: SceneExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list || !list.canSwitchState(item)) return;
		const { hidden } = item;
		const backups = list.setRecursiveStates(item, 'hidden', !hidden);
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Scene.requestRendering?.();
		Scene.history.save({
			type: 'scene-object-hidden',
			item: item,
			oldValues: backups,
			newValue: !hidden
		});
	};

const onSceneLockPointerdown =
	(item: SceneExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list || !list.canSwitchState(item)) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Scene.history.save({
			type: 'scene-object-locked',
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const sceneNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as SceneExtrasNode;
	const element = container.parentNode as HTMLElement | null;
	const nodes: VNode[] = [];
	if (node.class !== 'folder') {
		element?.classList.add('reference');
	} else {
		element?.classList.remove('reference');
	}
	if (node === getSceneStore().tilemap) {
		element?.classList.add('highlight');
	}
	if (node.conditions instanceof Array) {
		const condition = node.enabled
			? node.conditions.length !== 0
				? 'conditional'
				: 'none'
			: 'absent';
		if (condition === 'none') {
			element?.classList.remove('weak');
		} else {
			if (condition === 'conditional') {
				element?.classList.remove('weak');
			} else {
				element?.classList.add('weak');
			}
			nodes.push(
				h(
					'span',
					{ class: ['node-icon', 'icon-conditional'] },
					condition === 'conditional' ? '?' : '!'
				)
			);
		}
	}
	if (node.events instanceof Array && node.events.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-eventEnabled'] }, 'E'));
	}
	if (node.scripts instanceof Array && node.scripts.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-scriptEnabled'] }, '\uf121'));
	}
	nodes.push(
		h(
			'span',
			{
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onSceneVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	);
	nodes.push(
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onSceneLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	);
	return nodes;
};

const sceneNodeIcon = (item: unknown): VNode[] => {
	const node = item as SceneExtrasNode;
	switch (node.class) {
		case 'folder':
			return [h('span', { class: ['node-icon', 'icon-folder'] })];
		case 'actor': {
			const team = Data.teams?.map?.[node.teamId ?? ''];
			const hex = team ? team.color : 'ffffffff';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [
				h(
					'span',
					{ class: 'node-icon', style: { color: `rgba(${r}, ${g}, ${b}, ${a})` } },
					'\uf2c0'
				)
			];
		}
		case 'region': {
			const hex = node.color ?? '';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [
				h('span', {
					class: ['node-icon', 'icon-scene-region'],
					style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }
				})
			];
		}
		case 'light':
			return [
				h(
					'span',
					{
						class: 'node-icon',
						style: { color: `rgba(${node.red}, ${node.green}, ${node.blue})` }
					},
					'\uf006'
				)
			];
		case 'animation':
			return [h('span', { class: 'node-icon' }, '\uf110')];
		case 'particle':
			return [h('span', { class: 'node-icon' }, '\uf2dc')];
		case 'parallax': {
			const path = File.getPath?.(node.image);
			if (path) {
				return [
					h('span', {
						class: ['node-icon', 'icon-scene-parallax'],
						style: { backgroundImage: CSS.encodeURL(File.route!(path)) }
					})
				];
			}
			return [h('span', { class: 'node-icon' }, '\uf1c5')];
		}
		case 'tilemap':
			return [h('span', { class: 'node-icon' }, '\uf00a')];
		default:
			return [h('span', { class: ['node-icon', 'icon-file'] })];
	}
};

const onUiVisibilityPointerdown =
	(item: UiExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { instance, hidden } = item;
		const backups1 = list.setRecursiveStates(item, 'hidden', !hidden);
		const backups2 = list.setRecursiveStates(instance, 'visible', hidden);
		const length = Math.max(backups1.length, backups2.length);
		for (let i = 0; i < length; i++) {
			if (backups1[i] === backups2[i]) {
				throw new Error('Failed to switch hidden state');
			}
		}
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		UI.requestRendering?.();
		UI.history.save({
			type: 'ui-object-hidden',
			item: item,
			oldValues1: backups1,
			oldValues2: backups2,
			newValue: !hidden
		});
	};

const onUiLockPointerdown =
	(item: UiExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		UI.history.save({
			type: 'ui-object-locked',
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const uiNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as UiExtrasNode;
	const element = container.parentNode as HTMLElement | null;
	const nodes: VNode[] = [];
	if (node.class !== 'folder') {
		element?.classList.add('reference');
	} else {
		element?.classList.remove('reference');
	}
	if (node.enabled) {
		element?.classList.remove('weak');
	} else {
		element?.classList.add('weak');
		nodes.push(h('span', { class: ['node-icon', 'icon-conditional'] }, '!'));
	}
	if (node.events instanceof Array && node.events.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-eventEnabled'] }, 'E'));
	}
	if (node.scripts instanceof Array && node.scripts.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-scriptEnabled'] }, '\uf121'));
	}
	nodes.push(
		h(
			'span',
			{
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onUiVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	);
	nodes.push(
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onUiLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	);
	return nodes;
};

const uiNodeIcon = (item: unknown): VNode[] => {
	const node = item as UiExtrasNode;
	const classes = {
		image: 'icon-ui-image',
		text: 'icon-ui-text',
		textbox: 'icon-ui-textbox',
		dialogbox: 'icon-ui-dialogbox',
		progressbar: 'icon-ui-progressbar',
		button: 'icon-ui-button',
		animation: 'icon-ui-animation',
		video: 'icon-ui-video',
		window: 'icon-ui-window',
		container: 'icon-ui-container',
		reference: 'icon-ui-reference'
	} as Record<string, string>;
	let iconClass: string;
	if (node.class === 'reference') {
		const preset = Data.uiPresets?.[node.prefabId ?? ''];
		const presetClass = classes[preset?.data?.class ?? ''];
		iconClass =
			presetClass && presetClass !== 'icon-ui-reference' ? presetClass : 'icon-ui-reference';
	} else {
		iconClass = classes[node.class ?? ''] ?? 'icon-ui-reference';
	}
	const iconClasses = [iconClass];
	if (node.class === 'reference' && iconClass !== 'icon-ui-reference') {
		iconClasses.push('icon-ui-reference-active');
	}
	if (UI.hasPrefab?.(node)) {
		iconClasses.push('icon-ui-set-as-prefab');
	}
	return [h('span', { class: ['node-icon', iconClasses] })];
};

const animationNodeExtras = (item: unknown): VNode[] => {
	const node = item as { loop?: boolean };
	if (node.loop) {
		return [h('span', { class: ['node-icon', 'icon-loop'] }, '\uf112')];
	}
	return [];
};

const animationNodeIcon = (_item: unknown): VNode[] => {
	return [h('span', { class: ['node-icon', 'icon-string'] })];
};

const onLayerVisibilityPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { hidden } = item;
		const backups = list.setRecursiveStates(item, 'hidden', !hidden);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Animation.requestRendering?.();
		Animation.history.save({
			type: 'animation-layer-hidden',
			motion: getAnimationStore().motion,
			direction: getAnimationStore().direction,
			item: item,
			oldValues: backups,
			newValue: !hidden
		});
	};

const onLayerLockPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Animation.history.save({
			type: 'animation-layer-locked',
			motion: getAnimationStore().motion,
			direction: getAnimationStore().direction,
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const layerNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as LayerExtrasNode;
	return [
		h(
			'span',
			{
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onLayerVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		),
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onLayerLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	];
};

const layerNodeIcon = (item: unknown): VNode[] => {
	const node = item as LayerExtrasNode & { class?: string };
	const classes = {
		joint: 'anim-layer-joint',
		sprite: 'anim-layer-sprite',
		particle: 'anim-layer-particle',
		sound: 'anim-layer-sound'
	} as Record<string, string>;
	return [h('span', { class: ['node-icon', classes[node.class ?? ''] ?? ''] })];
};

const onParticleVisibilityPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { hidden } = item;
		item.hidden = !hidden;
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Particle.requestRendering?.();
		Particle.history!.save({
			type: 'particle-layer-hidden',
			item: item,
			oldValue: hidden,
			newValue: !hidden
		});
	};

const particleNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as LayerExtrasNode;
	return [
		h(
			'span',
			{
				style: { right: '0' },
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onParticleVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	];
};

const particleNodeIcon = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { image?: string; sprite?: { hframes: number; vframes: number } };
	const path = File.getPath?.(node.image);
	if (path) {
		queueMicrotask(() => {
			const icon = container.querySelector('.node-icon') as HTMLElement | null;
			if (icon) {
				setIconClip(
					icon,
					path,
					0,
					0,
					-(node.sprite?.hframes ?? 1),
					-(node.sprite?.vframes ?? 1)
				);
			}
		});
		return [h('span', { class: ['node-icon', 'icon-particle-image'] })];
	}
	return [h('span', { class: 'node-icon' }, '\uf2dc')];
};

const dirs = ref<string[]>([]);
const direction = ref(-1);
const dirListEl = ref<HTMLElement | null>(null);
// M5-c：palette 容器 ref（显式登记 items 用）
const paletteNavEl = ref<HTMLElement | null>(null);
const paletteManagerEl = ref<HTMLElement | null>(null);

const animation = getAnimationStore();

const speedModel = computed<number>({
	get: () => animation.speed ?? 0,
	set: (value: number) => {
		animation.setSpeed(value);
	}
});

const zoomModel = computed<number>({
	get: () => animation.zoom ?? 0,
	set: (value: number) => {
		animation.setZoom(value);
	}
});

const setDirItems = (items: string[], selected: number): void => {
	dirs.value = items;
	direction.value = selected;
};

const setDirDirection = (selected: number): void => {
	direction.value = selected;
};

const onDirPointerdown = (index: number): void => {
	if (index === direction.value) return;
	Animation?.setDirection?.(index);
	Inspector?.close?.();
};

onMounted(() => {
	const el = dirListEl.value;
	if (!el) return;
	attachElementApi(el, { setDirItems, setDirDirection });
	nextTick(() => {
		getUIStore().initialize();
		getParticleStore().initialize();
		getSceneStore().initialize();
		getAnimationStore().initialize();
		// M5-c：palette 显式登记（此时 palette 节点仍在 palette 宿主内，
		// 引擎装载前即可拿到权威 items 列表，无需按 DOM 形态猜测）。
		// 容器 ref 指向组件（NavBar/PageManager）→ 经 $el 取根元素后遍历子节点。
		registerLayoutItems(collectPaletteItems(paletteNavEl.value, paletteManagerEl.value));
	});
});

const onSceneHeadPointerdown = (event: PointerEvent) => {
	Scene?.headPointerdown?.(event);
};
const onHomeStartClick = (event: PointerEvent) => {
	Home?.startClick?.(event);
};
const onSceneSwitchPointerdown = (event: PointerEvent) => {
	Scene?.switchPointerdown?.(event);
};
const onSceneLayerPointerdown = (event: PointerEvent) => {
	Scene?.layerPointerdown?.(event);
};
const onSceneBrushPointerdown = (event: PointerEvent) => {
	Scene?.brushPointerdown?.(event);
};
const onSceneZoomInput = (value: number) => {
	Scene?.setZoom?.(value);
};
const onSceneZoomFocus = () => {
	Scene?.zoomFocus?.();
};
const onSceneScreenKeydown = (event: KeyboardEvent) => {
	Scene?.screenKeydown?.(event);
};
const onSceneScreenWheel = (event: WheelEvent) => {
	Scene?.screenWheel?.(event);
};
const onSceneMarqueePointerdown = (event: PointerEvent) => {
	Scene?.marqueePointerdown?.(event);
};
const onSceneMarqueeDoubleclick = (event: PointerEvent) => {
	Scene?.marqueeDoubleclick?.(event);
};
const onEasingIdWrite = (value: unknown) => {
	Curve?.easingIdWrite?.({ value: value as string } as unknown as Event);
};
const onEasingIdInput = (value: unknown) => {
	Curve?.easingIdInput?.({ value } as unknown as Event);
};
const onUiListChange = (event: Event) => {
	UI?.listChange?.(event);
};
const onAnimationListSelect = (event: Event & { value?: unknown }) => {
	Animation?.listSelect?.(event);
};
const onAnimationListRecord = (event: Event & { value?: unknown }) => {
	Animation?.listRecord?.(event);
};
const onAnimationListOpen = (event: Event & { value?: unknown }) => {
	Animation?.listOpen?.(event);
};
const onAnimationListPopup = (event: Event & { value?: unknown }) => {
	Animation?.listPopup?.(event);
};
const onAnimationListChange = (event: Event) => {
	Animation?.listChange?.(event);
};
const onLayerListSelect = (event: Event & { value?: unknown }) => {
	Animation?.layerListSelect?.(event);
};
const onLayerListRecord = (event: Event & { value?: unknown }) => {
	Animation?.layerListRecord?.(event);
};
const onLayerListPopup = (event: Event & { value?: unknown }) => {
	Animation?.layerListPopup?.(event);
};
const onLayerListChange = (event: Event) => {
	Animation?.layerListChange?.(event);
};
const onTimelineToolbarPointerdown = (event: PointerEvent) => {
	Animation?.timelineToolbarPointerdown?.(event);
};
const onUiHeadPointerdown = (event: PointerEvent) => {
	UI?.headPointerdown?.(event);
};
const onUiSwitchPointerdown = (event: PointerEvent) => {
	UI?.switchPointerdown?.(event);
};
const onUiShortcutPointerdown = (event: PointerEvent) => {
	UI?.shortcutPointerdown?.(event);
};
const onUiZoomInput = (value: number) => {
	UI?.setZoom?.(value);
};
const onUiZoomFocus = () => {
	UI?.zoomFocus?.();
};
const onUiScreenKeydown = (event: KeyboardEvent) => {
	UI?.screenKeydown?.(event);
};
const onUiScreenWheel = (event: WheelEvent) => {
	UI?.screenWheel?.(event);
};
const onUiMarqueePointerdown = (event: PointerEvent) => {
	UI?.marqueePointerdown?.(event);
};
const onUiMarqueeDoubleclick = (event: PointerEvent) => {
	UI?.marqueeDoubleclick?.(event);
};
const onAnimationHeadPointerdown = (event: PointerEvent) => {
	Animation?.headPointerdown?.(event);
};
const onAnimationSwitchPointerdown = (event: PointerEvent) => {
	Animation?.switchPointerdown?.(event);
};
const onAnimationZoomFocus = () => {
	Animation?.zoomFocus?.();
};
const onAnimationScreenKeydown = (event: KeyboardEvent) => {
	Animation?.screenKeydown?.(event);
};
const onAnimationScreenWheel = (event: WheelEvent) => {
	Animation?.screenWheel?.(event);
};
const onAnimationMarqueePointerdown = (event: PointerEvent) => {
	Animation?.marqueePointerdown?.(event);
};
const onAnimationMarqueeDoubleclick = (event: PointerEvent) => {
	Animation?.marqueeDoubleclick?.(event);
};
const onParticleHeadPointerdown = (event: PointerEvent) => {
	Particle?.headPointerdown?.(event);
};
const onParticleViewPointerdown = (event: PointerEvent) => {
	Particle?.viewPointerdown?.(event);
};
const onParticleControlPointerdown = (event: PointerEvent) => {
	Particle?.controlPointerdown?.(event);
};
const onParticleZoomInput = (value: number) => {
	Particle?.setZoom?.(value);
};
const onParticleZoomFocus = () => {
	Particle?.zoomFocus?.();
};
const onParticleScreenKeydown = (event: KeyboardEvent) => {
	Particle?.screenKeydown?.(event);
};
const onParticleScreenWheel = (event: WheelEvent) => {
	Particle?.screenWheel?.(event);
};
const onParticleMarqueePointerdown = (event: PointerEvent) => {
	Particle?.marqueePointerdown?.(event);
};
const onSceneListSelect = (event: Event & { value?: unknown }) => {
	Scene?.listSelect?.(event);
};
const onSceneListRecord = (event: Event & { value?: unknown }) => {
	Scene?.listRecord?.(event);
};
const onSceneListPopup = (event: Event & { value?: unknown }) => {
	Scene?.listPopup?.(event);
};
const onSceneListOpen = (event: Event & { value?: unknown }) => {
	Scene?.listOpen?.(event);
};
const onSceneListChange = (event: Event) => {
	Scene?.listChange?.(event);
};
const onUiListSelect = (event: Event) => {
	UI?.listSelect?.(event);
};
const onUiListRecord = (event: Event) => {
	UI?.listRecord?.(event);
};
const onUiListPopup = (event: Event) => {
	UI?.listPopup?.(event);
};
const onUiListOpen = (event: Event) => {
	UI?.listOpen?.(event);
};
</script>

<style>
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#project-browser {
	width: 100%;
	height: 100%;
}

#scene,
#ui,
#animation,
#particle {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: var(--stage-page-background);
}

#scene-head {
	display: flex;
	position: absolute;
	flex: 1 0 auto;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#scene-head-start {
	display: flex;
	flex: 0 0 auto;
	width: 115px;
	/* background: yellow; */
}

#scene-head-center {
	display: flex;
	flex: 0 0 auto;
	/* background: green; */
	border-left: var(--toolbar-item-border);
}

#scene-layer,
#scene-brush {
	display: flex;
}

#scene-head-end {
	flex: 0 0 auto;
	/* background: blue; */
}

#scene-zoom {
	margin: 2px 4px;
	right: 0;
	width: 80px;
}

#scene-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#scene-info {
	position: absolute;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}

#scene-list-head {
	position: absolute;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#scene-searcher {
	margin: 2px;
	width: calc(100% - 4px);
}

#scene-list {
	position: absolute;
	width: 100%;
	height: 100%;
}

#ui-head {
	display: flex;
	position: absolute;
	flex: 1 0 auto;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#ui-head-start {
	display: flex;
	flex: 0 0 auto;
	width: 28px;
	/* background: yellow; */
}

#ui-head-center {
	display: flex;
	flex: 0 0 auto;
	/* background: green; */
	border-left: var(--toolbar-item-border);
}

#ui-head-end {
	flex: 0 0 auto;
	/* background: blue; */
}

#ui-zoom {
	margin: 2px 4px;
	right: 0;
	width: 80px;
}

#ui-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#ui-list-head {
	position: absolute;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#ui-searcher {
	margin: 2px;
	width: calc(100% - 4px);
}

#ui-list {
	position: absolute;
	width: 100%;
	height: 100%;
}

#scene-object,
#ui-element,
#animation-motion {
	position: absolute;
	width: 100%;
	height: 100%;
}

#inspector-page-manager {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
}

#project-confirm {
	right: 108px;
	bottom: 10px;
}

#project-cancel {
	right: 10px;
	bottom: 10px;
}

/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileImage {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

#fileVideo {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

#fileTileset {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

/* 样式迁移：由 Project/css/layout.css 迁入组件（选择器为全局 id，不能用 scoped） */
#layout-content {
	display: none;
}

#workspace-page-manager {
	position: absolute;
	left: 0;
	top: 28px;
	right: 0;
	bottom: 0;
	/* 覆盖 YMPageManager 模块类的 height:100%
	 * 否则 top+height 并存时 bottom:0 失效，高度超出窗口 28px */
	height: auto;
	overflow: hidden;
	border-top: var(--nav-bar-border);
}

#home-content {
	display: block;
	position: absolute;
	/* 稍微调整显示位置 */
	margin-left: -40px;
	margin-top: 20px;
	left: 100px;
	top: 100px;
	width: 636px;
	height: 522px;
	/* background-color: yellow; */
}

#home-version {
	position: absolute;
	margin-top: 40px;
	width: 100%;
	height: 100px;
	font-weight: bold;
	color: var(--home-title-color);
	font-weight: bold;
}

#home-title {
	position: absolute;
	width: 100%;
	height: 100px;
	font-size: 32px;
	font-weight: bold;
	color: var(--home-title-color);
	/* background-color: green; */
}

#home-start-list {
	display: flex;
	position: absolute;
	flex-direction: column;
	left: 0;
	top: 100px;
	width: 160px;
	height: 422px;
	row-gap: 10px;
	/* background-color: red; */
}
</style>

