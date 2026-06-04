export const colors = {
  canvas: '#eeefe9',
  surfaceCard: '#ffffff',
  surfaceSoft: '#e5e7e0',
  surfaceDark: '#23251d',

  ink: '#23251d',
  body: '#4d4f46',
  charcoal: '#33342d',
  mute: '#6c6e63',
  ash: '#9b9c92',
  stone: '#b6b7af',

  primary: '#f7a501',
  primaryPressed: '#dd9001',
  onPrimary: '#23251d',

  hairline: '#bfc1b7',
  hairlineSoft: '#dcdfd2',

  accentBlue: '#2c84e0',
  accentBlueSoft: '#dceaf6',
  accentRed: '#cd4239',
  accentRedSoft: '#f7d6d3',
  accentGreen: '#2c8c66',
  accentGreenSoft: '#d9eddf',
} as const;

export type Colors = typeof colors;
