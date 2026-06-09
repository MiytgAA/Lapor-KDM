// src/lib/colors.ts

export const Colors = {
  // Primary
  primary: '#080808',
  onPrimary: '#ffffff',
  canvas: '#ffffff',
  hairline: '#d8d8d8',

  // Accents
  purple: '#7a3dff',
  pink: '#ed52cb',
  blue: '#3b89ff',
  orange: '#ff6b00',
  green: '#00d722',

  // Semantic
  pending: '#ffae13',
  approved: '#00d722',
  rejected: '#ee1d36',
  info: '#146ef5',

  // Text
  ink: '#080808',
  inkStrong: '#222222',
  body: '#363636',
  bodyMid: '#5a5a5a',
  mute: '#898989',
  muteSoft: '#ababab',

  // Backgrounds
  bgLight: '#f7f7f7',
  bgMuted: '#f0f0f0',
  bgBlue: '#f0f7ff',
  bgRed: '#fee2e2',
  bgGreen: '#dcfce7',
  bgYellow: '#fef9c3',
} as const;

export const statusColor = (status: string) => {
  switch (status) {
    case 'approved': return Colors.approved;
    case 'rejected': return Colors.rejected;
    default: return Colors.pending;
  }
};

export const statusBg = (status: string) => {
  switch (status) {
    case 'approved': return Colors.bgGreen;
    case 'rejected': return Colors.bgRed;
    default: return Colors.bgYellow;
  }
};

export const statusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
    default: return 'Menunggu';
  }
};
