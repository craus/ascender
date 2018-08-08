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
    },
    tick: function(deltaTime) {
    },
    save: function() {
    },
    load: function() {
    }
  }, params)
	
  if (savedata[id] != undefined) {
    result.load(savedata[id])
  }
	
	return result
}  