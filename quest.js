
quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var quality = gaussianRandom(0, 0.5 + 0.2 * log(resources.level()+7, 100))
    var power = gaussianRandom(0.1 * resources.level(), 0.5 * Math.pow(resources.level()+7, 0.25) - 0.1)
    var rewardPower = quality + power
    result.difficulty = Math.pow(10, power + 0.03 * resources.level())    
    result.reward = Math.pow(10, quality + power - 3)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()*resources.idle()+this.difficulty)
    },
    choose: function() {
      if (resources.idle() < minIdleForQuest) {
        return
      }
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farmIncome.value += this.reward
      } else {
        resources.life.value -= 1
        resources.activeLife.value -= 1
      }
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
      panel.find('.choose').toggleClass('disabled', resources.idle() < minIdleForQuest)
    },
    save: function() {
      savedata.quests.push(Object.assign({
      }, _.omit(this)))
    },
    destroy: function() {
      panel.remove()
    },
  })
  
  setFormattedText(panel.find('.danger'), large(result.difficulty))
  setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
  setFormattedText(panel.find('.reward'), large(result.reward))
  panel.find('.choose').click(() => result.choose())
  
  return result
} 