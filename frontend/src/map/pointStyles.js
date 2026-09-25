const TYPE_STYLES = {
  culture: {
    label: 'Культура',
    color: '#7c3aed',
    fillColor: '#c4b5fd',
    icon: 'M6 8h20v4H6z M8 13h3v9H8z M15 13h3v9h-3z M22 13h3v9h-3z M5 23h22v3H5z M16 4l11 3H5z',
  },
  landmark: {
    label: 'Ориентир',
    color: '#b91c1c',
    fillColor: '#fca5a5',
    icon: 'M16 3l10 8h-3v15h-5v-8h-4v8H9V11H6z',
  },
  park: {
    label: 'Парк',
    color: '#15803d',
    fillColor: '#86efac',
    icon: 'M16 4c4 0 7 3 7 7 0 3-2 6-5 7v8h-4v-8c-3-1-5-4-5-7 0-4 3-7 7-7z',
  },
  sport: {
    label: 'Спорт',
    color: '#1d4ed8',
    fillColor: '#93c5fd',
    icon: 'M16 4a12 12 0 100 24 12 12 0 000-24z M8 16h16 M16 4c3 3 4 7 4 12s-1 9-4 12 M16 4c-3 3-4 7-4 12s1 9 4 12',
  },
  street: {
    label: 'Улица',
    color: '#ca8a04',
    fillColor: '#fde68a',
    icon: 'M15 4h2l5 24h-4l-1-7h-2l-1 7h-4z M12 4h-2L5 28h4l1-7h2l1 7h4z M14 8h4 M13 14h6 M12 20h8',
  },
  transport: {
    label: 'Транспорт',
    color: '#0f766e',
    fillColor: '#5eead4',
    icon: 'M8 7c0-2 2-4 4-4h8c2 0 4 2 4 4v14c0 2-2 4-4 4l2 3h-4l-1-2h-2l-1 2h-4l2-3c-2 0-4-2-4-4z M11 8h10v6H11z M11 20h3 M18 20h3',
  },
  venue: {
    label: 'Площадка',
    color: '#c2410c',
    fillColor: '#fdba74',
    icon: 'M7 10h18v14H7z M10 7h12v3H10z M11 14h4v4h-4z M17 14h4v4h-4z M11 20h10',
  },
};

const DEFAULT_TYPE_STYLE = {
  label: 'Точка',
  color: '#1f6f56',
  fillColor: '#f0b13e',
  icon: 'M16 4a10 10 0 00-10 10c0 7 10 14 10 14s10-7 10-14A10 10 0 0016 4z M16 10a4 4 0 110 8 4 4 0 010-8z',
};

export function getTypeStyle(type) {
  return TYPE_STYLES[type] ?? DEFAULT_TYPE_STYLE;
}
