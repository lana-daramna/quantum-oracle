const crypto = require('crypto');

const isArabic = (t) =>
  /[\u0600-\u06FF]/.test(String(t || ''));

const pick = (a) =>
  a[crypto.randomInt(a.length)];

function fallbackAr(options, decision) {
  if (options) {
    const w =
      decision === 'YES'
        ? options.first
        : options.second;

    return pick([
      `${w}. شفت هالمسار من قبل.`,
      `${w}. هاي أوضح إشارة طلعت للعرّاف.`,
      `روح على ${w}. المستقبل بيشكرك.`,
      `${w}. الكيوبتات صوّتت وخلص الموضوع.`,
    ]);
  }

  return pick(
    decision === 'YES'
      ? [
          'اعملها. المسار قدامك أخضر.',
          'يلا، المستقبل بيبتسملك.',
          'نعم. الإشارة واضحة وما فيها تردد.',
          'خذها. هاد الطريق مكتوب باسمك.',
        ]
      : [
          'لا، مش هالمرة. التوقيت غلط.',
          'اتركها. في إشي أحسن جاي.',
          'استنى. المسار هاد مش لصالحك.',
          'لا. الكيوبتات حذّرتني.',
        ]
  );
}

module.exports = { isArabic, fallbackAr };