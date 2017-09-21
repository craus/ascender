tech = function(initialValue, id, params) {
  var result = variable(initialValue, id, params)
  return Object.assign(result, {
    paint: function() {
      $('.'+id).toggle(this.value == 0)
    }
  })
}  