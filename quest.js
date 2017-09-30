quest = function(initialValue, id, params) {
  var result = variable(initialValue, id, params)
  return Object.assign(result, {
    paint: function() {
    },
    save: function() {
      return 
    }
  })
}  