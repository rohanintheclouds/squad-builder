// Hidden player rating (0-99) used by draft scoring. NEVER shown during play.
//
// RATING METHODOLOGY (this is the logic to follow whenever ratings are refreshed):
//   1. SofaScore season rating is the PRIMARY signal (current form / consistency this season).
//      Pull from sofascore.com (their /news/ rating round-ups are fetchable). ~6.8 = solid
//      starter, ~7.5 = excellent season, ~7.9+ = elite season.
//   2. EA FC26 overall is the ABILITY anchor (blend ~ 55% SofaScore form / 45% FC26 ability),
//      so a single hot season doesn't overrate a limited player, and a quiet season for a great
//      player pulls them down (e.g. Wirtz/Lautaro down; Rice ≥ Rodri this season).
//   3. Market value is DE-EMPHASISED — only the formula fallback below uses it, capped low, so a
//      pricey but unproven player isn't auto-rated highly.
//   Edit OVERRIDES freely; keys must match players.json `name` exactly.

export const OVERRIDES: Record<string, number> = {
  // --- Elite (89-91) ---
  'Kylian Mbappé': 92, 'Lamine Yamal': 92, 'Erling Haaland': 91, 'Harry Kane': 90,
  'Michael Olise': 90, 'Vinícius Júnior': 89, 'Jude Bellingham': 89,
  // --- Top (86-88) ---
  'Mohamed Salah': 87, 'Bukayo Saka': 88, 'Declan Rice': 88, 'Ousmane Dembélé': 88,
  'Gianluigi Donnarumma': 88, 'Alisson': 86, 'Dominik Szoboszlai': 87, 'Pedri': 87,
  'Vitinha': 87, 'Jamal Musiala': 87, 'Rúben Dias': 87, 'William Saliba': 87,
  'Virgil van Dijk': 87, 'Thibaut Courtois': 87, 'Federico Valverde': 87, 'Raphinha': 87,
  'Achraf Hakimi': 87, 'Lionel Messi': 87, 'Rodri': 86, 'Cole Palmer': 86, 'Phil Foden': 86,
  'Khvicha Kvaratskhelia': 86, 'Martin Ødegaard': 86, 'Frenkie de Jong': 86, 'Alexander Isak': 86,
  'Julián Álvarez': 86, 'Bruno Fernandes': 86, 'Gabriel Magalhães': 86, 'Sandro Tonali': 86,
  'Nuno Mendes': 86, 'Mike Maignan': 86, 'David Raya': 86, 'Robert Lewandowski': 86, 'Ederson': 84,
  // --- Very good (84-85) ---
  'Lautaro Martínez': 85, 'Florian Wirtz': 85, 'Viktor Gyökeres': 85, 'Nico Williams': 85,
  'Bruno Guimarães': 85, 'Alessandro Bastoni': 85, 'Marquinhos': 85, 'Joško Gvardiol': 85,
  'Dayot Upamecano': 85, 'Cristian Romero': 85, 'Trent Alexander-Arnold': 85, 'Rafael Leão': 85,
  'Pedro Neto': 85, 'Antoine Griezmann': 85, 'Omar Marmoush': 85, 'Gabriel Martinelli': 85,
  'Theo Hernández': 84, 'Emiliano Martínez': 85, 'Kevin De Bruyne': 85, 'Manuel Neuer': 85,
  'João Neves': 85, 'Aurélien Tchouaméni': 84, 'Jérémy Doku': 84, 'Cody Gakpo': 84,
  'Eberechi Eze': 84, 'Anthony Gordon': 84, 'Jules Koundé': 84, 'Arda Güler': 84,
  'Pau Cubarsí': 84, 'Micky van de Ven': 84, 'Marc Guéhi': 84, 'Manuel Locatelli': 84,
  'Luka Modrić': 84, 'Nico Schlotterbeck': 84, 'Désiré Doué': 84, 'Fermín López': 84,
  'Kenan Yıldız': 84, 'Alexis Mac Allister': 85, 'Tijjani Reijnders': 84, 'Gonçalo Ramos': 84,
  'Karim Benzema': 84, 'Mateo Retegui': 84,
  // --- Good (82-83) ---
  'Reece James': 83, 'Levi Colwill': 83, 'Dean Huijsen': 83, 'Yan Diomande': 83, 'Estêvão': 83,
  'Hugo Ekitiké': 83, 'João Pedro': 83, 'Matheus Cunha': 83, 'Benjamin Šeško': 83,
  'Warren Zaïre-Emery': 83, 'Aleksandar Pavlović': 83, 'Morgan Gibbs-White': 83, 'Mohammed Kudus': 83,
  'Guglielmo Vicario': 83, 'Unai Simón': 84, 'Rúben Neves': 83, 'Scott McTominay': 84,
  'Mikel Oyarzabal': 84, 'Mikel Merino': 83, 'Matthijs de Ligt': 84, 'Lisandro Martínez': 83,
  'Jonathan Tah': 83, 'Ibrahima Konaté': 84, 'Nicolò Barella': 85, 'Federico Dimarco': 84,
  'Antoine Semenyo': 83, 'Morgan Rogers': 82, 'Elliot Anderson': 82, 'Marcus Rashford': 82,
  'Christopher Nkunku': 82, 'Riyad Mahrez': 82, 'Neymar': 82, 'Richarlison': 81,
  'Giorgi Mamardashvili': 82, 'André Onana': 81, 'Denzel Dumfries': 83, 'Ollie Watkins': 84,
  'Rasmus Højlund': 81, 'Joelinton': 82, 'Youri Tielemans': 82, 'Diogo Dalot': 82,
  'Sadio Mané': 81, 'Sergio Ramos': 80, 'Thomas Müller': 81, 'Marco Reus': 79,
  'Pape Matar Sarr': 81, 'Eduardo Camavinga': 84, 'Nico Paz': 83, 'Gavi': 83,
  'Lennart Karl': 82, 'Franco Mastantuono': 82, 'Rayan Cherki': 84, 'Kai Havertz': 83,
  'Dominic Solanke': 82, 'Luis Díaz': 85,
}

const LEAGUE_ADJ: Record<string, number> = {
  'La Liga': 0, 'Premier League': 0, 'Bundesliga': 0, 'Serie A': 0, 'Ligue 1': 0,
  'Liga Portugal': -1, Eredivisie: -1, 'Süper Lig': -1, 'Pro League': -1, Brasileirão: -1,
  'Saudi Pro League': -1, 'Russian PL': -1, 'Super League': -2, SuperLiga: -2, Segunda: -3, Other: -2,
}

// Fallback ONLY: value-derived and intentionally conservative (value is de-emphasised) so an
// uncurated, pricey-but-unproven player tops out modestly. Curate notable players above instead.
export function formulaRating(value: number | null, league: string): number {
  if (value == null) return 76
  const adj = LEAGUE_ADJ[league] ?? -1
  return Math.max(70, Math.min(83, Math.round(58 + 11 * Math.log10(Math.max(1, value)) + adj)))
}

export function ratingFor(name: string, value: number | null, league: string): number {
  return OVERRIDES[name] ?? formulaRating(value, league)
}

/**
 * Future outlook from current ability + age: young players gain upside, veterans decline.
 * Used by Squad Builder's team rating, NOT by draft scoring (which judges current ability).
 */
export function potentialFor(current: number, age: number): number {
  const growth = age <= 23 ? Math.min(8, Math.round((23 - age) * 1.5)) : 0
  const decline = age >= 30 ? Math.round((age - 29) * 1.0) : 0
  return Math.max(45, Math.min(96, current + growth - decline))
}
