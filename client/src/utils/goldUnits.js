export const TOLA_IN_GRAMS = 11.6638;

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs 0';
  return 'Rs ' + Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });
};

export const gramsToTolaMashaRati = (grams) => {
  if (!grams || isNaN(grams)) return { tola: 0, masha: 0, rati: 0 };
  const totalTolas = Number(grams) / TOLA_IN_GRAMS;
  const tola = Math.floor(totalTolas);
  const remainingMasha = (totalTolas - tola) * 12;
  const masha = Math.floor(remainingMasha);
  const rati = Number(((remainingMasha - masha) * 8).toFixed(1));
  return { tola, masha, rati };
};

export const tolaMashaRatiToString = ({ tola = 0, masha = 0, rati = 0 }) => {
  return `${tola}T - ${masha}M - ${rati}R`;
};

export const formatTolaMashaRatiUrdu = (grams) => {
  if (!grams || isNaN(grams) || Number(grams) <= 0) return '0 تولہ 0 ماشہ';
  const { tola, masha, rati } = gramsToTolaMashaRati(grams);
  
  const parts = [];
  if (tola > 0) parts.push(`${tola} تولہ`);
  if (masha > 0) parts.push(`${masha} ماشہ`);
  if (rati > 0) parts.push(`${rati} رتی`);
  
  if (parts.length === 0) return '0 تولہ 0 ماشہ';
  return parts.join(' ');
};
