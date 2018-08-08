mission = function(id, params) {
  if (params == undefined) {
    params = {}
  }
  var result = Object.assign({
    id: id,
		level: 1,
    paint: function() {
      setFormattedText($('.#{0}.level, .#{0} .level'.i(id)), this.level)
      setFormattedText($('.#{0}.level1, .#{0} .level1'.i(id)), this.level == 1 ? '' : this.level)
      setFormattedText($('.#{0}.name, .#{0} .name'.i(id)), this.name)
      setFormattedText($('.#{0}.desc, .#{0} .desc'.i(id)), this.desc())
      setProgress($('.#{0} .progressBar'.i(id)), this.progressPercent())
      setFormattedText($('.#{0} .currentProgress'.i(id)), this.progress())
      setFormattedText($('.#{0} .maxProgress'.i(id)), this.maxProgress())
      setFormattedText($('.#{0} .progressPercent'.i(id)), Format.round(this.progressPercent(), 2))
      setFormattedText($('.#{0} .progressPercent0'.i(id)), Format.percent(this.progress() / this.maxProgress()))
    },
    tick: function(deltaTime) {
    },
    save: function() {
			return this
    },
    load: function(data) {
			Object.assign(this, data)
    },
		active: function() {
			return true
		},
		click: function() {
		},
		complete: function() {
			this.level += 1
			this.reset()
		},
		reset: function() {
		},
		progress: function() {
			return 0
		},
		maxProgress: function() {
			return 1
		},
		progressPercent: function() {
			return 100 * this.progress() / this.maxProgress() 
		}
  }, params)
	
  if (savedata[id] != undefined) {
    result.load(savedata[id])
  }
	
	$('.theButton').click(() => {
		if (result.active()) {
			result.click()
		}
	})
	
	return result
}  