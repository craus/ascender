hero = (params={}) => {
  var panel = instantiate('heroSample')
  $('.heroes').append(panel)
  var tab = instantiate('heroTabSample')
  $('.heroTabs').append(tab)

  var name = names.rnd()
  for (var i = 0; i < 100; i++) {
    if (heroes.every(x => x.name != name)) {
      break
    }
    name = names.rnd()
  }
  
  var hero = Object.assign({
    name: name,
    skills: {
      defense: 1,
      speed: 1,
      wealth: 1,
      intelligence: 1
    },
    level: 0,
    skillPoints: 0,
    experience: 0,
    deselect: function() {
      tab.removeClass('active')
      panel.removeClass('active')
      panel.removeClass('in')
    },
    select: function() {
      if (!!selectedHero) {
        selectedHero.deselect()
      }
      selectedHero = this
      tab.addClass('active')
      panel.addClass('active')
      panel.addClass('in')
    },
    abandon: function() {
      this.quest.abandon()
    },
    status: function() {
      if (this.quest) {
        if (this.quest.completed()) {
          return "Completed — " + this.quest.name
        }
        return "On a quest — #{0} (#{1})".i(this.quest.name, Format.percent(this.quest.progress()))
      }
      if (this.selected) {
        return "Waiting for a quest"
      }
      return "Idle"
    },
    experienceToLevelUp: function() {
      return 10*Math.pow(2, this.level)
    },
    learn: function(exp) {
      this.experience += exp
      while (this.experience >= this.experienceToLevelUp()) {
        this.experience -= this.experienceToLevelUp()
        this.level += 1
        this.skillPoints += 1
      }
    },
    skillUp: function(skill) {
      if (this.skillPoints < 1) {
        return
      }
      this.skillPoints -= 1
      this.skills[skill] *= 1.2
    },
    paint: function() {
      setFormattedText(panel.find('.status'), this.status())
      setFormattedText(tab.find('.status'), this.status())
      setFormattedText(panel.find('.level'), this.level)
      setFormattedText(tab.find('.level'), this.level)
      setFormattedText(panel.find('.skillPoints'), this.skillPoints)
      panel.find('.skillPointsNotZero').toggle(this.skillPoints > 0)
      panel.find('.speedUp').toggle(this.skillPoints > 0)
      panel.find('.defenseUp').toggle(this.skillPoints > 0)
      panel.find('.intelligenceUp').toggle(this.skillPoints > 0)
      panel.find('.wealthUp').toggle(this.skillPoints > 0)
      setFormattedText(panel.find('.speed'), this.skills.speed)
      setFormattedText(panel.find('.defense'), this.skills.defense)
      setFormattedText(panel.find('.intelligence'), this.skills.intelligence)
      setFormattedText(panel.find('.wealth'), this.skills.wealth)
      setFormattedText(panel.find('.experience'), large(this.experience))
      setFormattedText(panel.find('.experienceToLevelUp'), this.experienceToLevelUp())
      enable(panel.find('.start'), matchable())
      panel.find('.start').toggle(!this.quest)
      panel.find('.abandon').toggle(!!this.quest && !this.quest.completed())
      panel.find('.claimReward').toggle(!!this.quest && this.quest.completed())
    },
    save: function() {
      savedata.heroes.push(Object.assign({
        questIndex: quests.indexOf(this.quest)
      }, _.omit(this, 'quest', 'questIndex')))
    },
    destroy: function() {
      panel.remove()
      tab.remove()
      heroes.splice(heroes.indexOf(this), 1)
      if (selectedHero == this) {
        selectedHero = null
      }
    }
  }, params)
  
  setFormattedText(panel.find('.name'), hero.name)
  setFormattedText(tab.find('.name'), hero.name)
  panel.find('.start').click(matchHeroAndQuest)
  panel.find('.abandon').click(() => hero.abandon())
  panel.find('.speedUp').click(() => hero.skillUp('speed'))
  panel.find('.defenseUp').click(() => hero.skillUp('defense'))
  panel.find('.intelligenceUp').click(() => hero.skillUp('intelligence'))
  panel.find('.wealthUp').click(() => hero.skillUp('wealth'))
  panel.find('.claimReward').click(() => hero.quest.claimReward())
  
  tab.find('a').click(() => hero.select())
  return hero
}