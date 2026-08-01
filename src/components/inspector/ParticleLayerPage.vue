<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="particleLayer-general-grid">
			<text>{{ local.getLabel('particleLayer-name') || 'Name' }}</text><text-box id="particleLayer-name"></text-box>
			<text>{{ local.getLabel('particleLayer-area-type') || 'Emission Area' }}</text
			><select-box id="particleLayer-area-type"></select-box> <text>{{ local.getLabel('particleLayer-area-x') || 'X' }}</text
			><number-box
				id="particleLayer-area-x"
				min="-10000"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('particleLayer-area-y') || 'Y' }}</text
			><number-box
				id="particleLayer-area-y"
				min="-10000"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('particleLayer-area-width') || 'Width' }}</text
			><number-box
				id="particleLayer-area-width"
				min="0"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('particleLayer-area-height') || 'Height' }}</text
			><number-box
				id="particleLayer-area-height"
				min="0"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('particleLayer-area-radius') || 'Radius' }}</text
			><number-box
				id="particleLayer-area-radius"
				min="0"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('particleLayer-count') || 'Emission Count' }}</text
			><number-box
				id="particleLayer-count"
				min="0"
				max="1000000000"
			></number-box>
			<text>{{ local.getLabel('particleLayer-delay') || 'Initial Delay' }}</text
			><number-box
				id="particleLayer-delay"
				min="0"
				max="1000000000"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('particleLayer-interval') || 'Interval' }}</text
			><number-box
				id="particleLayer-interval"
				min="0"
				max="1000000000"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('particleLayer-lifetime') || 'Lifetime' }}</text
			><number-box
				id="particleLayer-lifetime"
				min="0"
				max="1000000000"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('particleLayer-lifetimeDev') || 'Lifetime Dev' }}</text
			><number-box
				id="particleLayer-lifetimeDev"
				min="0"
				max="1000000000"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('particleLayer-fadeout') || 'Fadeout' }}</text
			><number-box
				id="particleLayer-fadeout"
				min="0"
				max="1000000000"
				unit="ms"
			></number-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-anchor-grid') || 'Anchor' }}</detail-summary>
		<detail-grid id="particleLayer-anchor-grid">
			<text>{{ local.getLabel('particleLayer-anchor-x-box') || 'Anchor X' }}</text>
			<flex-box id="particleLayer-anchor-x-box">
				<number-box
					id="particleLayer-anchor-x-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-anchor-x-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-anchor-y-box') || 'Anchor Y' }}</text>
			<flex-box id="particleLayer-anchor-y-box">
				<number-box
					id="particleLayer-anchor-y-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-anchor-y-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-anchor-speedX-box') || 'Anchor Speed X' }}</text>
			<flex-box id="particleLayer-anchor-speedX-box">
				<number-box
					id="particleLayer-anchor-speedX-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-anchor-speedX-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-anchor-speedY-box') || 'Anchor Speed Y' }}</text>
			<flex-box id="particleLayer-anchor-speedY-box">
				<number-box
					id="particleLayer-anchor-speedY-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-anchor-speedY-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-movement-grid') || 'Movement' }}</detail-summary>
		<detail-grid id="particleLayer-movement-grid">
			<text>{{ local.getLabel('particleLayer-movement-angle-box') || 'Movement Angle' }}</text>
			<flex-box id="particleLayer-movement-angle-box">
				<number-box
					id="particleLayer-movement-angle-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-movement-angle-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-movement-speed-box') || 'Movement Speed' }}</text>
			<flex-box id="particleLayer-movement-speed-box">
				<number-box
					id="particleLayer-movement-speed-0"
					min="-10000"
					max="10000"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-movement-speed-1"
					min="0"
					max="10000"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-movement-accelAngle-box') || 'Accel Angle' }}</text>
			<flex-box id="particleLayer-movement-accelAngle-box">
				<number-box
					id="particleLayer-movement-accelAngle-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-movement-accelAngle-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-movement-accel-box') || 'Accel' }}</text>
			<flex-box id="particleLayer-movement-accel-box">
				<number-box
					id="particleLayer-movement-accel-0"
					min="-10000"
					max="10000"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-movement-accel-1"
					min="0"
					max="10000"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-rotation-grid') || 'Rotation' }}</detail-summary>
		<detail-grid id="particleLayer-rotation-grid">
			<text>{{ local.getLabel('particleLayer-rotation-angle-box') || 'Rotation Angle' }}</text>
			<flex-box id="particleLayer-rotation-angle-box">
				<number-box
					id="particleLayer-rotation-angle-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-rotation-angle-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-rotation-speed-box') || 'Angular Velocity' }}</text>
			<flex-box id="particleLayer-rotation-speed-box">
				<number-box
					id="particleLayer-rotation-speed-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-rotation-speed-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-rotation-accel-box') || 'Angular Accel' }}</text>
			<flex-box id="particleLayer-rotation-accel-box">
				<number-box
					id="particleLayer-rotation-accel-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-rotation-accel-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-hRotation-grid') || 'Horizontal Rotation' }}</detail-summary>
		<detail-grid id="particleLayer-hRotation-grid">
			<text>{{ local.getLabel('particleLayer-hRotation-radius-box') || 'Initial Radius' }}</text>
			<flex-box id="particleLayer-hRotation-radius-box">
				<number-box
					id="particleLayer-hRotation-radius-0"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-radius-1"
					min="0"
					max="10000"
					decimals="4"
					unit="px"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-hRotation-expansionSpeed-box') || 'Expansion Speed' }}</text>
			<flex-box id="particleLayer-hRotation-expansionSpeed-box">
				<number-box
					id="particleLayer-hRotation-expansionSpeed-0"
					min="-10000"
					max="10000"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-expansionSpeed-1"
					min="0"
					max="10000"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-hRotation-expansionAccel-box') || 'Expansion Accel' }}</text>
			<flex-box id="particleLayer-hRotation-expansionAccel-box">
				<number-box
					id="particleLayer-hRotation-expansionAccel-0"
					min="-10000"
					max="10000"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-expansionAccel-1"
					min="0"
					max="10000"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-hRotation-angle-box') || 'Rotation Angle' }}</text>
			<flex-box id="particleLayer-hRotation-angle-box">
				<number-box
					id="particleLayer-hRotation-angle-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-angle-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-hRotation-angularSpeed-box') || 'Angular Velocity' }}</text>
			<flex-box id="particleLayer-hRotation-angularSpeed-box">
				<number-box
					id="particleLayer-hRotation-angularSpeed-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-angularSpeed-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-hRotation-angularAccel-box') || 'Angular Accel' }}</text>
			<flex-box id="particleLayer-hRotation-angularAccel-box">
				<number-box
					id="particleLayer-hRotation-angularAccel-0"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-hRotation-angularAccel-1"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-scale-grid') || 'Scale' }}</detail-summary>
		<detail-grid id="particleLayer-scale-grid">
			<text>{{ local.getLabel('particleLayer-scale-factor-box') || 'Scale Factor' }}</text>
			<flex-box id="particleLayer-scale-factor-box">
				<number-box
					id="particleLayer-scale-factor-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-scale-factor-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-scale-speed-box') || 'Expansion Speed' }}</text>
			<flex-box id="particleLayer-scale-speed-box">
				<number-box
					id="particleLayer-scale-speed-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-scale-speed-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-scale-accel-box') || 'Expansion Accel' }}</text>
			<flex-box id="particleLayer-scale-accel-box">
				<number-box
					id="particleLayer-scale-accel-0"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">std</text></number-box
				>
				<number-box
					id="particleLayer-scale-accel-1"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><text class="label">dev</text></number-box
				>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('particleLayer-rendering-grid') || 'Rendering' }}</detail-summary>
		<detail-grid id="particleLayer-rendering-grid">
			<text>{{ local.getLabel('particleLayer-image') || 'Image' }}</text
			><custom-box
				id="particleLayer-image"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('particleLayer-blend') || 'Blend' }}</text><select-box id="particleLayer-blend"></select-box>
			<text>{{ local.getLabel('particleLayer-light') || 'Light Sampling' }}</text
			><select-box id="particleLayer-light"></select-box> <text>{{ local.getLabel('particleLayer-sort') || 'Sort' }}</text
			><select-box id="particleLayer-sort"></select-box>
			<text>{{ local.getLabel('particleLayer-sprite-mode') || 'Sprite Mode' }}</text
			><select-box id="particleLayer-sprite-mode"></select-box>
			<text>{{ local.getLabel('particleLayer-sprite-hframes') || 'Horiz Frames' }}</text
			><number-box
				id="particleLayer-sprite-hframes"
				min="1"
				max="100"
			></number-box>
			<text>{{ local.getLabel('particleLayer-sprite-vframes') || 'Vert Frames' }}</text
			><number-box
				id="particleLayer-sprite-vframes"
				min="1"
				max="100"
			></number-box>
			<text>{{ local.getLabel('particleLayer-sprite-interval') || 'Animation Interval' }}</text
			><number-box
				id="particleLayer-sprite-interval"
				min="1"
				max="5000"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('particleLayer-color-mode') || 'Color Mode' }}</text
			><select-box id="particleLayer-color-mode"></select-box>
			<text>{{ local.getLabel('particleLayer-color-rgba-box') || 'Color' }}</text>
			<flex-box id="particleLayer-color-rgba-box">
				<number-box
					id="particleLayer-color-rgba-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-rgba-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-rgba-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-rgba-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-min-box') || 'Color Min' }}</text>
			<flex-box id="particleLayer-color-min-box">
				<number-box
					id="particleLayer-color-min-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-min-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-min-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-min-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-max-box') || 'Color Max' }}</text>
			<flex-box id="particleLayer-color-max-box">
				<number-box
					id="particleLayer-color-max-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-max-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-max-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-max-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-easingId') || 'Color Easing' }}</text
			><select-box id="particleLayer-color-easingId"></select-box>
			<text>{{ local.getLabel('particleLayer-color-startMin-box') || 'Color Start Min' }}</text>
			<flex-box id="particleLayer-color-startMin-box">
				<number-box
					id="particleLayer-color-startMin-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-startMin-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-startMin-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-startMin-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-startMax-box') || 'Color Start Max' }}</text>
			<flex-box id="particleLayer-color-startMax-box">
				<number-box
					id="particleLayer-color-startMax-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-startMax-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-startMax-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-startMax-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-endMin-box') || 'Color End Min' }}</text>
			<flex-box id="particleLayer-color-endMin-box">
				<number-box
					id="particleLayer-color-endMin-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-endMin-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-endMin-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-endMin-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-endMax-box') || 'Color End Max' }}</text>
			<flex-box id="particleLayer-color-endMax-box">
				<number-box
					id="particleLayer-color-endMax-0"
					min="0"
					max="255"
					step="5"
					><text class="label red">R</text></number-box
				>
				<number-box
					id="particleLayer-color-endMax-1"
					min="0"
					max="255"
					step="5"
					><text class="label green">G</text></number-box
				>
				<number-box
					id="particleLayer-color-endMax-2"
					min="0"
					max="255"
					step="5"
					><text class="label blue">B</text></number-box
				>
				<number-box
					id="particleLayer-color-endMax-3"
					min="0"
					max="255"
					step="5"
					><text class="label">A</text></number-box
				>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-tint-0-box') || 'Tint - Red' }}</text>
			<flex-box id="particleLayer-color-tint-0-box">
				<slider-box
					id="particleLayer-color-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="particleLayer-color-tint-0"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-tint-1-box') || 'Tint - Green' }}</text>
			<flex-box id="particleLayer-color-tint-1-box">
				<slider-box
					id="particleLayer-color-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="particleLayer-color-tint-1"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-tint-2-box') || 'Tint - Blue' }}</text>
			<flex-box id="particleLayer-color-tint-2-box">
				<slider-box
					id="particleLayer-color-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="particleLayer-color-tint-2"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('particleLayer-color-tint-3-box') || 'Tint - Grayscale' }}</text>
			<flex-box id="particleLayer-color-tint-3-box">
				<slider-box
					id="particleLayer-color-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="particleLayer-color-tint-3"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
		</detail-grid>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useParticleStore } from '@app/stores/particle';
import { useLocalStore } from '@app/stores/local';

const particle = useParticleStore();
const local = useLocalStore();

onMounted(() => {
	particle.syncState();
	local.syncState();
});
</script>
