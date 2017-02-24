quest = (params={}) => {
  var panel = instantiate('questSample')
  $('.quests').append(panel)
  var tab = instantiate('questTabSample')
  $('.questTabs').append(tab)
  
  var name = questNames.rnd()
  for (var i = 0; i < 100; i++) {
    if (quests.every(q => q.name != name)) {
      break
    }
    name = questNames.rnd()
  }
  
  var result = Object.assign({
    name: name,
    duration: Math.round(10 * Math.pow(2, params.level + gaussianRandom(0, 0.5))),
    danger: Math.pow(2, params.level + gaussianRandom(0, 0.5)),
    experience: Math.round(5*Math.pow(2, params.level + gaussianRandom(0, 0.5))),
    gold: Math.round(10*Math.pow(2, params.level + gaussianRandom(0, 0.5))),
    deselect: function() {
      tab.removeClass('active')
      panel.removeClass('active')
      panel.removeClass('in')
    },
    select: function() {
      if (!!selectedQuest) {
        selectedQuest.deselect()
      }
      selectedQuest = this
      tab.addClass('active')
      panel.addClass('active')
      panel.addClass('in')
    },
    start: function() {
      this.startedAt = Date.now()
    },
    started: function() {
      return !!this.startedAt
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
        return "In Progress — #{0} (#{1})".i(this.hero.name, Format.percent(this.progress()))
      }
      if (this.selected) {
        return "Waiting for a hero"
      }
      return "Idle"
    },
    spentDuration: function() {
      if (!this.startedAt) {
        return 0
      }
      return (Date.now() - this.startedAt)/1000
    },
    remainingDuration: function() {
      return Math.max(0,this.effectiveDuration() - this.spentDuration())
    },
    progress: function() {
      return this.spentDuration() / this.effectiveDuration()
    },
    idle: function() {
      return !this.hero
    },
    completed: function() {
      return this.remainingDuration() <= 0
    },
    inProgress: function() {
      return !!this.hero && !this.completed()
    },
    man: function() {
      return this.hero || selectedHero
    },
    effectiveDuration: function() {
      if (!this.man()) {
        return this.duration
      }
      return this.duration / this.man().skills.speed
    },
    effectiveExperience: function() {
      return this.experience * this.man().skills.intelligence
    },
    deathChance: function() {
      return this.danger / (this.danger + this.man().skills.defense)
    },
    effectiveGold: function() {
      return this.gold * this.man().skills.wealth
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      setFormattedText(tab.find('.status'), this.status())
      setFormattedText(panel.find('.duration'), Format.time(this.duration))
      setFormattedText(panel.find('.remainingDuration'), Format.time(Math.ceil(this.remainingDuration())))
      
      panel.find('.started').toggle(this.started())
      panel.find('.notStarted').toggle(!this.started())
      panel.find('.man').toggle(!!this.man())
      if (this.man()) {
        setFormattedText(panel.find('.effectiveDuration'), Format.time(this.effectiveDuration()))
        setFormattedText(panel.find('.effectiveGold'), large(this.effectiveGold()))
        setFormattedText(panel.find('.deathChance'), Format.percent(this.deathChance()))
        setFormattedText(panel.find('.effectiveExperience'), large(this.effectiveExperience()))
      }
      setFormattedText(panel.find('.danger'), large(this.danger))
      setFormattedText(panel.find('.experience'), large(this.experience))
      setFormattedText(panel.find('.gold'), large(this.gold))
      setFormattedText(panel.find('.level'), this.level)
      setFormattedText(tab.find('.level'), this.level)
      enable(panel.find('.start'), matchable())
      panel.find('.start').toggle(this.idle())
      panel.find('.abandon').toggle(this.inProgress())
      panel.find('.claimReward').toggle(this.completed())
    },
    save: function() {
      savedata.quests.push(Object.assign({
        heroIndex: heroes.indexOf(this.hero)
      }, _.omit(this, 'hero', 'heroIndex')))
    },
    claimReward: function() {
      resources.gold.value += this.effectiveGold()
      this.hero.learn(this.effectiveExperience())
      this.abandon()
      this.destroy()
      quests.push(quest({level: this.level}))
      if (rndEvent(questChance())) {
        quests.push(quest({level: this.level+1}))
      }
    },
    destroy: function() {
      panel.remove()
      tab.remove()
      quests.splice(quests.indexOf(this), 1)
      if (selectedQuest == this) {
        selectedQuest = null
      }
    }
  }, params)
  
  setFormattedText(panel.find('.name'), result.name)
  setFormattedText(tab.find('.name'), result.name)
  panel.find('.start').click(matchHeroAndQuest)
  panel.find('.abandon').click(() => result.abandon())
  panel.find('.claimReward').click(() => result.claimReward())
  
  tab.find('a').click(() => result.select())
  return result
}