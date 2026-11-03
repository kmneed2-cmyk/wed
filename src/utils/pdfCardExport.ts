// Generates a crisp, royal Emerald & Gold Printable HTML / PDF Wedding Card
// and triggers either a direct PDF print dialog or standalone royal HTML/PDF sheet download.

export interface PrintableEventItem {
  id: 'mehndi' | 'baraat' | 'walima';
  shortName: string;
  title: string;
  urduSubtitle: string;
  dateLabel: string;
  isoDate: string;
  timeRange: string;
  venueName: string;
  address: string;
  mapEmbedQuery: string;
  dressCode: string;
  rasmHighlights: { time: string; label: string }[];
}

export interface PrintableWeddingData {
  salamHeading: string;
  arabicDua: string;
  urduRomanDua: string;
  groomName: string;
  brideName: string;
  hostParentsLine: string;
  weddingDatesSummary: string;
  cityLabel: string;
  events: PrintableEventItem[];
}

export function triggerWeddingCardPdfPrint() {
  window.print();
}
