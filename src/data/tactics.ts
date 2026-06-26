import type { Tactic } from '../types'

export const TACTICS: Tactic[] = [
  {
    id: 'tiki-taka',
    name: 'Tiki-Taka',
    blurb: 'Short passing, possession, overloads through the middle.',
    emphasis: ['CDM', 'CM', 'CAM'],
    wants: 'Technical, high-passing midfielders and a creative CAM.',
  },
  {
    id: 'gegenpress',
    name: 'Gegenpress',
    blurb: 'High press, win the ball high, fast vertical attacks.',
    emphasis: ['ST', 'CM', 'LW', 'RW'],
    wants: 'High-workrate forwards and energetic box-to-box midfielders.',
  },
  {
    id: 'counter',
    name: 'Counter-Attack',
    blurb: 'Sit deep, absorb pressure, break at pace.',
    emphasis: ['ST', 'RW', 'LW', 'CB'],
    wants: 'Pacey wingers and strikers, solid defenders.',
  },
  {
    id: 'wing-play',
    name: 'Wing Play',
    blurb: 'Stretch the pitch, get to the byline, cross for the striker.',
    emphasis: ['LW', 'RW', 'LB', 'RB', 'ST'],
    wants: 'Attacking fullbacks, wide men, a target striker.',
  },
  {
    id: 'park-the-bus',
    name: 'Low Block',
    blurb: 'Compact, deep, defensively disciplined.',
    emphasis: ['CB', 'CDM', 'LB', 'RB'],
    wants: 'Strong defenders and a screening midfielder.',
  },
]
