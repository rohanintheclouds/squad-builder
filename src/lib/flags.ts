// Nationality -> flag emoji. Extend as the dataset grows.
const FLAGS: Record<string, string> = {
  Spain: '🇪🇸', Norway: '🇳🇴', France: '🇫🇷', Portugal: '🇵🇹', Georgia: '🇬🇪',
  Brazil: '🇧🇷', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Ecuador: '🇪🇨', Germany: '🇩🇪', Argentina: '🇦🇷',
  Hungary: '🇭🇺', Turkey: '🇹🇷', 'Ivory Coast': '🇨🇮', Sweden: '🇸🇪', Morocco: '🇲🇦',
  Italy: '🇮🇹', Slovenia: '🇸🇮', Belgium: '🇧🇪', Cameroon: '🇨🇲', Nigeria: '🇳🇬',
  Colombia: '🇨🇴', Croatia: '🇭🇷', Netherlands: '🇳🇱', Denmark: '🇩🇰', Senegal: '🇸🇳',
  Switzerland: '🇨🇭', Uzbekistan: '🇺🇿', Ghana: '🇬🇭', Uruguay: '🇺🇾', Egypt: '🇪🇬',
  Canada: '🇨🇦', Gambia: '🇬🇲', Algeria: '🇩🇿', Mali: '🇲🇱', Ukraine: '🇺🇦',
  Japan: '🇯🇵', Serbia: '🇷🇸', USA: '🇺🇸', Greece: '🇬🇷', Austria: '🇦🇹',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Burkina Faso': '🇧🇫', 'DR Congo': '🇨🇩', Kosovo: '🇽🇰',
  Poland: '🇵🇱', Slovakia: '🇸🇰', Guinea: '🇬🇳',
  Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', Ireland: '🇮🇪', 'Northern Ireland': '🇬🇧', Montenegro: '🇲🇪', Russia: '🇷🇺',
  'Bosnia-Herzegovina': '🇧🇦', Iceland: '🇮🇸', Paraguay: '🇵🇾', Mozambique: '🇲🇿', Armenia: '🇦🇲',
  Israel: '🇮🇱', 'South Korea': '🇰🇷',
}

export function flag(nationality: string): string {
  return FLAGS[nationality] ?? '🏳️'
}
