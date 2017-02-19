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
      matchHeroAndQuest()
    },
    abandon: function() {
      this.quest.hero = null
      this.quest = null
    },
    status: function() {
      if (this.quest) {
        return "On a quest — " + this.quest.name
      }
      if (this.selected) {
        return "Waiting for a quest"
      }
      return "Idle"
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      enable(panel.find('.select'), !this.selected && !this.quest)
      panel.find('.select').toggle(!this.quest)
      panel.find('.abandon').toggle(!!this.quest)
    },
    save: function() {
      savedata.heroes.push({
        name: this.name,
        selected: this.selected,
        questIndex: quests.indexOf(this.quest)
      })
    }
  }, params)
  
  setFormattedText(panel.find('.name'), hero.name)
  panel.find('.select').click(() => hero.select())
  panel.find('.abandon').click(() => hero.abandon())

  return hero
}