quest = (params={}) => {
  var quest = Object.assign({
    name: questNames.rnd()
  }, params)

  var panel = instantiate('questSample')
  $('.quests').append(panel)
  setFormattedText(panel.find('.name'), quest.name)
  
  return quest
}