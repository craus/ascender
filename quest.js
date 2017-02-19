quest = (params={}) => {
  var panel = instantiate('questSample')
  $('.quests').append(panel)
  
  var quest = Object.assign({
    name: questNames.rnd(),
    selected: false,
    duration: Math.round(20 * Math.pow(2, params.level + gaussianRandom(0, 1))),
    deselect: function() {
      this.selected = false
    },
    select: function() {
      quests.each('deselect')
      this.selected = true
      matchHeroAndQuest()
    },
    start: function() {
      this.startedAt = Date.now()
    },
    abandon: function() {
      this.hero.quest = null
      this.hero = null
      this.startedAt = null
    },
    status: function() {
      if (this.hero) {
        if (this.completed()) {
          return "Completed — " + this.hero.name
        }
        return "In Progress — " + this.hero.name
      }
      if (this.selected) {
        return "Waiting for a hero"
      }
      return "Idle"
    },
    spentDuration: function() {
      return (Date.now() - this.startedAt)/1000
    },
    remainingDuration: function() {
      return Math.max(0,this.duration - this.spentDuration())
    },
    completed: function() {
      return this.remainingDuration() <= 0
    },
    inProgress: function() {
      return this.hero && !this.completed()
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      if (this.startedAt) {
        setFormattedText(panel.find('.duration'), "#{0} / #{1}".i(Format.time(Math.ceil(this.remainingDuration())), Format.time(this.duration)))
      } else {
        setFormattedText(panel.find('.duration'), Format.time(this.duration))
      }
      enable(panel.find('.select'), !this.selected && !this.hero)
      panel.find('.select').toggle(!this.hero)
      panel.find('.abandon').toggle(!!this.hero)
    },
    save: function() {
      savedata.quests.push({
        name: this.name,
        selected: this.selected,
        startedAt: this.startedAt,
        duration: this.duration,
        heroIndex: heroes.indexOf(this.hero)
      })
    }
  }, params)
  
  setFormattedText(panel.find('.name'), quest.name)
  panel.find('.select').click(() => quest.select())
  panel.find('.abandon').click(() => quest.abandon())
  
  return quest
}