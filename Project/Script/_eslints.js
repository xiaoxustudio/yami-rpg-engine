'use strict'

const updateCommandElement = CommandList.prototype.updateCommandElement
CommandList.prototype.updateCommandElement = function (element) {
	const ret = updateCommandElement.call(this, ...arguments)

	element.querySelectorAll('command-mark-major').forEach((e) => {
		e.remove()
	})

	element.querySelectorAll('command-mark-minor').forEach((e) => {
		e.remove()
	})

	// 创建前缀
	let pre = document.createElement('command-mark-major')
	pre.textContent = ''
	element.insertBefore(pre, element.firstElementChild)
	element.pre = pre

	//创建辅助线
	element.lines = []
	for (let i = element.dataIndent; i >= 0; i--) {
		let line = document.createElement('command-line')
		line.style.marginLeft = this.computeTextIndent(i)
		element.insertBefore(line, element.firstElementChild)
		element.lines[i] = line
	}

	return ret
}

const commandList = document.querySelector('#event-commands')

commandList.getSelectionPosition = function () {
	return this.elements[this.active].pre.getBoundingClientRect()
}

commandList.on('update', function () {
	for (var i = 0; i < this.elements.count; i++) {
		const e = this.elements[i]
		if (e.fold) {
			e.mark = 'header'
		} else {
			e.mark = 'item'
			var buffer = e.dataItem?.buffer
			if (buffer && buffer.length > 1) {
				e.mark = 'option'
				if (buffer[buffer.length - 1] == e) {
					e.mark = 'footer'
				}
			}
		}
		e.classList.add(e.mark)
	}
})
