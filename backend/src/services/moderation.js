import Filter from 'bad-words';

const filter = new Filter();

export function checkProfanity(text) {
  return {
    isProfane: filter.isProfane(text),
    cleaned: filter.clean(text),
  };
}

export function checkImageNSFW(imageUrl) {
  // Placeholder for free NSFW detection API (e.g., Sightengine, AWS Rekognition)
  // Return { isNSFW: boolean, confidence: number }
  return { isNSFW: false, confidence: 0 };
}
