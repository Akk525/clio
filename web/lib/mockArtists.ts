// web/lib/mockArtists.ts

export type MockArtist = {
    id: number;
    name: string;
    handle: string;
    artistWallet: string;
    token: string;
    tagline?: string;
  };
  
  export const MOCK_ARTISTS: MockArtist[] = [
    {
      id: 1,
      name: "Nova",
      handle: "@nova.wav",
      artistWallet: "0x1111111111111111111111111111111111111111",
      token: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tagline: "Hyperpop producer with onchain-only drops.",
    },
    {
      id: 2,
      name: "Echo",
      handle: "@echo.eth",
      artistWallet: "0x2222222222222222222222222222222222222222",
      token: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      tagline: "Lo-fi beats for late-night dev sessions.",
    },
    {
      id: 3,
      name: "Orion",
      handle: "@orion",
      artistWallet: "0x3333333333333333333333333333333333333333",
      token: "0xcccccccccccccccccccccccccccccccccccccccc",
      tagline: "Cinematic soundtracks inspired by sci-fi lore.",
    },
    {
      id: 4,
      name: "Lumen",
      handle: "@lumen.xyz",
      artistWallet: "0x4444444444444444444444444444444444444444",
      token: "0xdddddddddddddddddddddddddddddddddddddddd",
      tagline: "Indie vocals plus generative visuals.",
    },
    {
      id: 5,
      name: "Atlas",
      handle: "@atlas_onchain",
      artistWallet: "0x5555555555555555555555555555555555555555",
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      tagline: "Bass-heavy club tracks for degen hours.",
    },
  ];
  