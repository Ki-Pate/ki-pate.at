const EMPTY_MANIFEST = Object.freeze({ poster: null, clips: [] });

const arbeitsfluss = Object.freeze({
  poster: Object.freeze({
    src: new URL('../media/arbeitsfluss/poster.webp', import.meta.url).href,
    bytes: 26_110,
    sha256: '1C86F7BF950EF6FECB60F258F60542504F79B5379CA561F6BA731C415BD55D8F',
    width: 720,
    height: 1280,
  }),
  clips: Object.freeze([
    Object.freeze({
      src: new URL('../media/arbeitsfluss/clip-01.mp4', import.meta.url).href,
      bytes: 1_918_006,
      duration: 6,
      frames: 180,
      sha256: '1C28CCCAA79F0F8F5EE2D6869862867C4E0E1AC74FCFA6301442D974C3CFD13F',
    }),
    Object.freeze({
      src: new URL('../media/arbeitsfluss/clip-02.mp4', import.meta.url).href,
      bytes: 1_996_736,
      duration: 6,
      frames: 180,
      sha256: '7FDB0E50E9F697F051E87501C256A827C3ED7BAA41ECA16973C85010C976B646',
    }),
  ]),
});

const MEDIA_BY_ROUTE = Object.freeze({
  arbeitsfluss,
  'betrieb-im-schnitt': EMPTY_MANIFEST,
  'use-case-inseln': EMPTY_MANIFEST,
});

export function getMediaManifest(route) {
  return MEDIA_BY_ROUTE[route] ?? EMPTY_MANIFEST;
}
