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
      matchHeroAndQuest()
    },
    abandon: function() {
      this.hero.quest = null
      this.hero = null
    },
    status: function() {
      if (this.hero) {
        return "In Progress � " + this.hero.name
      }
      if (this.selected) {
        return "Waiting for a hero"
      }
      return "Idle"
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      enable(panel.find('.select'), !this.selected && !this.hero)
      panel.find('.select').toggle(!this.hero)
      panel.find('.abandon').toggle(!!this.hero)
    },
    save: function() {
      savedata.quests.push({
        name: this.name,
        selected: this.selected,
        heroIndex: heroes.indexOf(this.hero)
      })
    }
  }, params)
  
  setFormattedText(panel.find('.name'), quest.name)
  panel.find('.select').click(() => quest.select())
  panel.find('.abandon').click(() => quest.abandon())
  
  return quest
}