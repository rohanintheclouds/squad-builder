// Football-confederation continent per nation (used by Guess the Player: same continent = yellow).
const CONTINENT: Record<string, string> = {
  // Europe (UEFA)
  Spain: 'Europe', Norway: 'Europe', France: 'Europe', Portugal: 'Europe', Georgia: 'Europe',
  England: 'Europe', Germany: 'Europe', Hungary: 'Europe', Turkey: 'Europe', Sweden: 'Europe',
  Italy: 'Europe', Slovenia: 'Europe', Belgium: 'Europe', Croatia: 'Europe', Netherlands: 'Europe',
  Denmark: 'Europe', Switzerland: 'Europe', Ukraine: 'Europe', Serbia: 'Europe', Greece: 'Europe',
  Austria: 'Europe', Scotland: 'Europe', Kosovo: 'Europe', Poland: 'Europe', Slovakia: 'Europe',
  Wales: 'Europe', Ireland: 'Europe', 'Northern Ireland': 'Europe', Montenegro: 'Europe',
  Russia: 'Europe', 'Bosnia-Herzegovina': 'Europe', Iceland: 'Europe', Armenia: 'Europe', Israel: 'Europe',
  // South America (CONMEBOL)
  Brazil: 'South America', Ecuador: 'South America', Argentina: 'South America', Colombia: 'South America',
  Uruguay: 'South America', Paraguay: 'South America',
  // Africa (CAF)
  'Ivory Coast': 'Africa', Morocco: 'Africa', Cameroon: 'Africa', Nigeria: 'Africa', Senegal: 'Africa',
  Ghana: 'Africa', Egypt: 'Africa', Gambia: 'Africa', Algeria: 'Africa', Mali: 'Africa',
  'DR Congo': 'Africa', 'Burkina Faso': 'Africa', Guinea: 'Africa', Mozambique: 'Africa',
  // North America (CONCACAF)
  Canada: 'North America', USA: 'North America',
  // Asia (AFC)
  Uzbekistan: 'Asia', Japan: 'Asia', 'South Korea': 'Asia',
}

export function continentOf(nation: string): string | undefined {
  return CONTINENT[nation]
}
