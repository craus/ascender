hero = (params={}) => {
  var panel = instantiate('heroSample')
  $('.heroes').append(panel)

  var hero = Object.assign({
    name: names.rnd(),
    selected: false,
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
      this.selected = false
    },
    select: function() {
      heroes.each('deselect')
      this.selected = true
      matchHeroAndQuest()
    },
    abandon: function() {
      this.quest.abandon()
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
      setFormattedText(panel.find('.level'), this.level)
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
      setFormattedText(panel.find('.experience'), this.experience)
      setFormattedText(panel.find('.experienceToLevelUp'), this.experienceToLevelUp())
      enable(panel.find('.select'), !this.selected && !this.quest)
      panel.find('.select').toggle(!this.quest)
      panel.find('.abandon').toggle(!!this.quest)
    },
    save: function() {
      savedata.heroes.push(Object.assign({
        questIndex: quests.indexOf(this.quest)
      }, _.omit(this, 'quest', 'questIndex')))
    }
  }, params)
  
  setFormattedText(panel.find('.name'), hero.name)
  panel.find('.select').click(() => hero.select())
  panel.find('.abandon').click(() => hero.abandon())
  panel.find('.speedUp').click(() => hero.skillUp('speed'))
  panel.find('.defenseUp').click(() => hero.skillUp('defense'))
  panel.find('.intelligenceUp').click(() => hero.skillUp('intelligence'))
  panel.find('.wealthUp').click(() => hero.skillUp('wealth'))

  return hero
}