// web/lib/mockArtists.ts

export type MockArtist = {
    id: number;
    name: string;
    handle: string;
    artistWallet: string;
    token: string;
    tagline?: string;
  };
  
  // Aligned with the mock artist list in web/lib/mockData.ts so names/handles stay consistent.
  export const MOCK_ARTISTS: MockArtist[] = [
    {
      id: 1,
      name: "Taylor Swift",
      handle: "Taylor.Swift",
      artistWallet: "0x1111111111111111111111111111111111111111",
      token: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
      tagline: "Hyperpop-ready anthems with surprise drops.",
    },
    {
      id: 2,
      name: "The Weeknd",
      handle: "The.Weeknd",
      artistWallet: "0x2222222222222222222222222222222222222222",
      token: "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      tagline: "Late-night R&B with neon-laced hooks.",
    },
    {
      id: 3,
      name: "Gun n Roses",
      handle: "Gun_n_Roses",
      artistWallet: "0x3333333333333333333333333333333333333333",
      token: "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
      tagline: "Arena rock with cinematic crescendos.",
    },
    {
      id: 4,
      name: "Deadmau5",
      handle: "Deadmau.5",
      artistWallet: "0x4444444444444444444444444444444444444444",
      token: "0xd4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4",
      tagline: "Indie-electro pulses built for clubs.",
    },
    {
      id: 5,
      name: "Daft Punk",
      handle: "Daft_Punk",
      artistWallet: "0x5555555555555555555555555555555555555555",
      token: "0xe5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5",
      tagline: "Robot funk for late-night drives.",
    },
    {
      id: 6,
      name: "Seedhe Maut",
      handle: "Seedhe_Maut",
      artistWallet: "0x6666666666666666666666666666666666666666",
      token: "0xf6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6",
      tagline: "Delhi rap duo with razor-edged flows.",
    },
    {
      id: 7,
      name: "Daddy Yankee",
      handle: "Daddy_Yankee",
      artistWallet: "0x7777777777777777777777777777777777777777",
      token: "0x1717171717171717171717171717171717171717",
      tagline: "Reggaeton staples reimagined onchain.",
    },
    {
      id: 8,
      name: "Bad Bunny",
      handle: "badBunny",
      artistWallet: "0x8888888888888888888888888888888888888888",
      token: "0x2828282828282828282828282828282828282828",
      tagline: "Latin trap hooks with stadium energy.",
    },
    {
      id: 9,
      name: "Luke Combs",
      handle: "Luke_Combs",
      artistWallet: "0x9999999999999999999999999999999999999999",
      token: "0x3939393939393939393939393939393939393939",
      tagline: "Country storytelling scaled for arenas.",
    },
    {
      id: 10,
      name: "Charlie XCX",
      handle: "XCX",
      artistWallet: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      token: "0x4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a",
      tagline: "Pop experiments shaped for club floors.",
    },
  ];
  