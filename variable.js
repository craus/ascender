variable = function(initialValue, id, name, params) {
  if (params == undefined) {
    params = {}
  }
  if (name == undefined) {
    name = id
  }
  var income = params.income || (() => 0)
  if (savedata[id] != undefined) {
    initialValue = savedata[id]
  }
  var formatter = params.formatter || (function(x) { return large(Math.floor(x+eps)) })
  var incomeFormatter = params.incomeFormatter || (function(x) { return noZero(signed(large(Math.floor(x+eps)))) })
  var result = () => {
    return result.value
  }
  result.name = name
  return Object.assign(result, {
    value: initialValue, 
    id: id,
    paint: function() {
      var variable = this
      setFormattedText($('.#{0}.value, .#{0} .value'.i(id)), formatter(variable()))
      setFormattedText($('.#{0}.income, .#{0} .income'.i(id)), incomeFormatter(income()))
    },
    tick: function(deltaTime) {
      this.value += income()
    }
  })
}  