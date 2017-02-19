hero = (params={}) => {
  var hero = {
    name: names.rnd()
  }

  var panel = instantiate('heroSample')
  $('.heroes').append(panel)
  setFormattedText(panel.find('.name'), hero.name)

  return hero
}