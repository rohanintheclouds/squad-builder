const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }

const r = await fetch('https://understat.com/league/EPL', UA)
const html = await r.text()
const m = html.match(/var playersData\s*=\s*JSON\.parse\('(.*?)'\);/s)
if (m) {
  const decoded = m[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  const players = JSON.parse(decoded)
  console.log('Understat EPL players:', players.length)
  console.log('fields:', Object.keys(players[0]).join(','))
  players.sort((a, b) => b.goals - a.goals).slice(0, 6).forEach((p) =>
    console.log('  ' + p.player_name + ' | G' + p.goals + ' A' + p.assists + ' KP' + p.key_passes + ' xG' + (+p.xG).toFixed(1) + ' min' + p.time))
} else console.log('Understat parse failed')

for (const u of [
  'https://www.fotmob.com/api/leagues?id=47&season=2025-2026',
  'https://www.fotmob.com/api/playerData?id=961995',
]) {
  try { const rr = await fetch(u, UA); const t = await rr.text(); console.log('FotMob ' + u.slice(28, 60) + ' -> HTTP ' + rr.status + ' bytes ' + t.length) }
  catch (e) { console.log('FotMob err ' + e.message) }
}
