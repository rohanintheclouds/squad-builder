// Hidden player rating (0-99) used by World Cup scoring. NEVER shown during play.
//
// Two layers, blended by confidence:
//  1. OVERRIDES  — hand-set, FC26-informed ratings for players I can rate confidently
//                  (stars, legends, and players whose market value misrepresents ability).
//                  Edit these freely to tune skill ("make Yamal 92").
//  2. formula    — for everyone else, derived from market value + league tier. As confidence
//                  drops (lower-profile players), the formula does more of the work.
//
// Keys must match the player's `name` in players.json exactly.

export const OVERRIDES: Record<string, number> = {
  // --- 90+ ---
  'Erling Haaland': 91, 'Kylian Mbappé': 91, 'Rodri': 91, 'Vinícius Júnior': 90,
  'Jude Bellingham': 90, 'Harry Kane': 90, 'Lamine Yamal': 90, 'Pedri': 89,
  // --- 88-89 ---
  'Bukayo Saka': 89, 'Florian Wirtz': 89, 'Jamal Musiala': 89, 'Declan Rice': 89,
  'Alisson': 89, 'William Saliba': 88, 'Rúben Dias': 88, 'Thibaut Courtois': 88,
  'Vitinha': 88, 'Martin Ødegaard': 88, 'Lautaro Martínez': 89, 'Phil Foden': 88,
  'Mike Maignan': 87, 'Gianluigi Donnarumma': 88, 'Achraf Hakimi': 88, 'Virgil van Dijk': 88,
  // --- 86-87 ---
  'Cole Palmer': 87, 'Ousmane Dembélé': 88, 'Federico Valverde': 88, 'Bruno Guimarães': 86,
  'Alexis Mac Allister': 86, 'Moisés Caicedo': 87, 'Nico Williams': 86, 'Raphinha': 87,
  'Khvicha Kvaratskhelia': 87, 'Alexander Isak': 87, 'Viktor Gyökeres': 86, 'Julián Álvarez': 87,
  'Aurélien Tchouaméni': 86, 'Joško Gvardiol': 86, 'Dayot Upamecano': 86, 'Alessandro Bastoni': 87,
  'Enzo Fernández': 85, 'Dominik Szoboszlai': 85, 'Cristian Romero': 87, 'Marquinhos': 87,
  'Ederson': 85, 'André Onana': 84, 'Emiliano Martínez': 86, 'David Raya': 87,
  'Mohamed Salah': 88, 'Kevin De Bruyne': 86, 'Antoine Griezmann': 85,
  // --- legends / veterans (value understates them) ---
  'Lionel Messi': 88, 'Cristiano Ronaldo': 86, 'Luka Modrić': 85, 'Manuel Neuer': 86,
  'Thomas Müller': 83, 'Karim Benzema': 86, 'Sergio Ramos': 82,
  'Robert Lewandowski': 88, 'Neymar': 84, 'Sadio Mané': 83, 'Riyad Mahrez': 83, 'Marco Reus': 80,
  // --- strong regulars ---
  'Jonathan Tah': 84, 'Matthijs de Ligt': 85, 'Lisandro Martínez': 84, 'Ibrahima Konaté': 85,
  'Gabriel Magalhães': 87, 'Marc Cucurella': 84, 'Nicolò Barella': 87, 'Federico Dimarco': 85,
  'Scott McTominay': 85, 'Rúben Neves': 84, 'Manuel Locatelli': 83, 'Youri Tielemans': 83,
  'Denzel Dumfries': 84, 'Ollie Watkins': 85, 'Richarlison': 82, 'Christopher Nkunku': 84,
  'Mikel Oyarzabal': 85, 'Mikel Merino': 84, 'Joelinton': 83, 'Manuel Ugarte': 82,
  'Victor Osimhen': 88, 'Rasmus Højlund': 82, 'Kai Havertz': 84,
  'Dominic Solanke': 82, 'Eberechi Eze': 84, 'Anthony Gordon': 84, 'Morgan Gibbs-White': 84,
  'Cody Gakpo': 84, 'Luis Díaz': 86, 'Pedro Neto': 83, 'Jérémy Doku': 84,
  'Bryan Mbeumo': 85, 'Matheus Cunha': 84, 'Trent Alexander-Arnold': 86, 'Jules Koundé': 85,
  'Reece James': 84, 'Nuno Mendes': 86, 'Frenkie de Jong': 87,
  'Gavi': 84, 'Pau Cubarsí': 84, 'Dean Huijsen': 83, 'Micky van de Ven': 84,
  'Marc Guéhi': 84, 'Levi Colwill': 83, 'Mohammed Kudus': 83,
  'Rafael Leão': 86, 'Sandro Tonali': 85, 'Tijjani Reijnders': 84, 'Ryan Gravenberch': 84,
  'Martín Zubimendi': 85, 'Diogo Dalot': 83, 'Pape Matar Sarr': 81, 'Eduardo Camavinga': 85,
  'Arda Güler': 84, 'Nico Paz': 83, 'Amadou Onana': 82,
  'Ademola Lookman': 84, 'Marcus Rashford': 84, 'Christian Pulisic': 84, 'Weston McKennie': 80,
}

const LEAGUE_ADJ: Record<string, number> = {
  'La Liga': 0, 'Premier League': 0, 'Bundesliga': 0, 'Serie A': 0, 'Ligue 1': 0,
  'Liga Portugal': -1, Eredivisie: -1, 'Süper Lig': -1, 'Pro League': -1, Brasileirão: -1,
  'Saudi Pro League': -1, 'Russian PL': -1, 'Super League': -2, SuperLiga: -2, Segunda: -3, Other: -2,
}

/** Formula rating for players without a curated override. */
export function formulaRating(value: number | null, league: string): number {
  if (value == null) return 78
  const adj = LEAGUE_ADJ[league] ?? -1
  return Math.max(70, Math.min(90, Math.round(49.96 + 20.6 * Math.log10(Math.max(1, value)) + adj)))
}

export function ratingFor(name: string, value: number | null, league: string): number {
  return OVERRIDES[name] ?? formulaRating(value, league)
}

/**
 * Future outlook from current ability + age: young players gain upside, veterans decline.
 * Used by Squad Builder's team rating, NOT by World Cup scoring (which judges current ability).
 */
export function potentialFor(current: number, age: number): number {
  const growth = age <= 23 ? Math.min(8, Math.round((23 - age) * 1.5)) : 0
  const decline = age >= 30 ? Math.round((age - 29) * 1.0) : 0
  return Math.max(45, Math.min(96, current + growth - decline))
}
