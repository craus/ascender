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
    status: function() {
      if (this.quest) {
        return "On a quest"
      }
      if (this.selected) {
        return "Waiting for a quest"
      }
      return "Idle"
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      enable(panel.find('.select'), !this.selected && !this.quest)
    },
    save: function() {
      this.questIndex = quests.indexOf(quest)
    }
  }, params, {
    quest: params.questIndex ? quests[params.questIndex] : null,
  })
  
  setFormattedText(panel.find('.name'), hero.name)
  panel.find('.select').click(() => hero.select())

  return hero
}