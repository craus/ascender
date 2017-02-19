quest = (params={}) => {
  var panel = instantiate('questSample')
  $('.quests').append(panel)
  
  var quest = Object.assign({
    name: questNames.rnd(),
    selected: false,
    deselect: function() {
      this.selected = false
    },
    select: function() {
      quests.each('deselect')
      this.selected = true
    },
    paint: function() {
      panel.find('.selected').toggle(this.selected)
      panel.find('.select').toggle(!this.selected)
    }
  }, params)
  
  setFormattedText(panel.find('.name'), quest.name)
  panel.find('.select').click(() => quest.select())
  
  return quest
}