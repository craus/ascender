hero = (params={}) => {
  var panel = instantiate('heroSample')
  $('.heroes').append(panel)

  var hero = Object.assign({
    name: names.rnd(),
    selected: false,
    deselect: function() {
      this.selected = false
    },
    select: function() {
      heroes.each('deselect')
      this.selected = true
    },
    paint: function() {
      panel.find('.selected').toggle(this.selected)
      panel.find('.select').toggle(!this.selected)
    }
  }, params)
  
  setFormattedText(panel.find('.name'), hero.name)
  panel.find('.select').click(() => hero.select())

  return hero
}