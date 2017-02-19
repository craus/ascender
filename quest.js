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
    status: function() {
      if (this.hero) {
        return "In Progress"
      }
      if (this.selected) {
        return "Waiting for a hero"
      }
      return "Idle"
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      enable(panel.find('.select'), !this.selected && !this.hero)
    },
    save: function() {
      this.heroIndex = heroes.indexOf(hero)
    }
  }, params, {
    hero: params.heroIndex ? heroes[params.heroIndex] : null
  })
  
  setFormattedText(panel.find('.name'), quest.name)
  panel.find('.select').click(() => quest.select())
  
  return quest
}