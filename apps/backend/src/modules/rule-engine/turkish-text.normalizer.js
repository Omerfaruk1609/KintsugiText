export class TurkishTextNormalizer {
  static LEET_MAP = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    '$': 's'
  };

  /**
   * Metni leetspeak, noktalama hileleri ve tekrarlayan harflerden arındırır.
   */
  static normalize(rawText) {
    if (!rawText) return '';

    let text = rawText.toLowerCase().trim();

    // 1. Leetspeak dönüşümü (s4l4m -> salam)
    text = text.replace(/[013457@$]/g, (match) => this.LEET_MAP[match] || match);

    // 2. Harf aralarına konan nokta, tire, alt çizgi hilelerini kaldırma (s.e.l.a.m -> selam)
    text = text.replace(/([a-zçğıöşü])[\.\-_ ]+([a-zçğıöşü])/gi, '$1$2');

    // 3. Ardışık 3+ harf tekrarlarını 2 harfe düşürme (salaaaaam -> salaam)
    text = text.replace(/(.)\1{2,}/gu, '$1$1');

    return text;
  }
}
