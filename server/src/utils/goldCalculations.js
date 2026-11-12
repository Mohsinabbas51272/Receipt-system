/**
 * Gold Weight and Pricing Calculation Utilities
 * Standard gold units:
 * 1 Tola = 12 Masha = 96 Rati = 11.6638 grams
 */

const TOLA_IN_GRAMS = 11.6638;

function tolaToGrams(tola = 0, masha = 0, rati = 0) {
  const totalTolas = Number(tola) + Number(masha) / 12 + Number(rati) / 96;
  return totalTolas * TOLA_IN_GRAMS;
}

function gramsToTolaMashaRati(grams = 0) {
  const totalTolas = Number(grams) / TOLA_IN_GRAMS;
  const tola = Math.floor(totalTolas);
  const remainingMasha = (totalTolas - tola) * 12;
  const masha = Math.floor(remainingMasha);
  const rati = Number(((remainingMasha - masha) * 8).toFixed(2));
  return { tola, masha, rati };
}

function calculateItemTotal({
  grossWeight = 0,
  beadStoneWeight = 0,
  goldRate = 0, // per tola or per gram
  rateType = 'per_tola', // 'per_tola' or 'per_gram'
  makingCharges = 0,
  karat = '22K'
}) {
  const netWeightGrams = Math.max(0, Number(grossWeight) - Number(beadStoneWeight));
  
  let goldAmount = 0;
  if (rateType === 'per_tola') {
    const netWeightTola = netWeightGrams / TOLA_IN_GRAMS;
    goldAmount = netWeightTola * Number(goldRate);
  } else {
    goldAmount = netWeightGrams * Number(goldRate);
  }

  const total = goldAmount + Number(makingCharges);

  return {
    netWeightGrams: Number(netWeightGrams.toFixed(3)),
    goldAmount: Math.round(goldAmount),
    totalAmount: Math.round(total)
  };
}

module.exports = {
  TOLA_IN_GRAMS,
  tolaToGrams,
  gramsToTolaMashaRati,
  calculateItemTotal
};

