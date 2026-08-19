export const SHOP = {
  name: 'Mahadev Plywood & Hardware',
  legalName: 'Mahadev Plywood & Hardware',
  tagline: 'The Preferred Partner for Carpenters & Builders.',
  phone: '9410277723',
  phoneHref: 'tel:+919410277723',
  whatsappHref: 'https://wa.me/919410277723',
  email: 'rupesharoraji7@gmail.com',
  hours: '9 AM – 8 PM',
  address: {
    line1: 'Near Isha Apartments, Kaushalya Nagar',
    line2: 'Ekta Nagar, Daurli',
    city: 'Meerut',
    state: 'Uttar Pradesh',
    pin: '250001',
  },
  mapsUrl: 'https://maps.app.goo.gl/pK4ciHmvFaW2UPMZA',
  // Google's embed, restored. It is the heavier of the two, so the iframe is
  // only mounted once the block scrolls into view — see Contact.
  mapsEmbedUrl:
    'https://www.google.com/maps?q=Mahadev%20Plywood%20And%20Hardware%20Near%20Isha%20Apartments%20Kaushalya%20Nagar%20Ekta%20Nagar%20Daurli%20Meerut%20Uttar%20Pradesh%20250001&output=embed',
} as const;

export const BRANDS = [
  'Century',
  'Greenply',
  'Harison',
  'Godrej',
  'Jainson',
  'Mahacol',
  'Pidilite',
  'Jivanjor',
  'Bondtile',
] as const;

export type Category = {
  /** Short label used on the card face. */
  title: string;
  /** Four-to-five words, no more — it sits under a very large numeral. */
  blurb: string;
  items: string[];
};

export const CATALOG: Category[] = [
  {
    title: 'Ply & Boards',
    blurb: 'Sheet goods, every grade',
    items: [
      'Commercial plywood',
      'MR plywood',
      'BWR plywood',
      'BWP / Marine plywood',
      'MDF',
      'HDF',
      'Particle board',
      'Block board',
      'Flush doors',
      'PVC foam board',
      'Fiber sheets',
      'Acrylic sheets',
      'Polycarbonate sheets',
    ],
  },
  {
    title: 'Mica & Laminates',
    blurb: 'Surfaces and edge banding',
    items: [
      'Decorative mica / laminate sheets',
      'Plain mica',
      'Glossy mica',
      'Matte mica',
      'Textured mica',
      'Wooden-finish mica',
      'Acrylic laminate',
      'Edge band / edge tape',
      'PVC edge band',
    ],
  },
  {
    title: 'Door Locks & Fittings',
    blurb: 'Locks, handles, closers',
    items: [
      'Door locks',
      'Mortise locks',
      'Cylindrical locks',
      'Rim locks',
      'Padlocks',
      'Cabinet locks',
      'Godrej-type locks',
      'Door handles',
      'Door knobs',
      'Pull handles',
      'Lever handles',
      'Chitkani / latches',
      'Tower bolts',
      'Aldrops',
      'Door chains',
      'Hasps & staples',
      'Door stoppers',
      'Door closers',
      'Door catches',
      'Flush bolts',
      'Door peepholes',
      'Door hinges / kabza',
      'Hydraulic door closers',
    ],
  },
  {
    title: 'Window Hardware',
    blurb: 'Stays, rollers, mesh',
    items: [
      'Window handles',
      'Window locks',
      'Window latches',
      'Window hinges',
      'Window stays',
      'Casement stays',
      'Window bolts',
      'Sliding window rollers',
      'Window restrictors',
      'Aluminium jali / mesh',
      'Mosquito mesh',
      'Rat-proof / rodent-proof mesh',
      'SS wire mesh',
      'GI wire mesh',
    ],
  },
  {
    title: 'Furniture Hardware',
    blurb: 'Hinges, channels, brackets',
    items: [
      'Cabinet handles',
      'Cabinet knobs',
      'Cabinet hinges',
      'Concealed hinges',
      'Drawer channels',
      'Telescopic channels',
      'Drawer locks',
      'Magnetic catches',
      'Shelf brackets',
      'L-brackets',
      'Corner brackets',
      'Furniture brackets',
      'Sofa hinges',
      'Table fittings',
      'Bed fittings',
      'Wardrobe fittings',
    ],
  },
  {
    title: 'Curtain Fittings',
    blurb: 'Rods, rings, runners',
    items: [
      'Curtain rods / pipes',
      'Curtain brackets',
      'Curtain rings',
      'Curtain hooks',
      'Curtain channels',
      'Curtain runners',
      'Curtain end caps',
      'Curtain holders / tiebacks',
    ],
  },
  {
    title: 'Screws & Fasteners',
    blurb: 'Every size, every gauge',
    items: [
      'Wood screws',
      'Self-tapping screws',
      'Drywall screws',
      'Machine screws',
      'Nuts',
      'Bolts',
      'Washers',
      'Nails',
      'Panel pins',
      'Wall plugs / rawl plugs',
      'Anchor fasteners',
      'U-bolts',
      'Clamps',
      'Rivets',
      'Binding wire',
    ],
  },
  {
    title: 'Adhesives & Sealants',
    blurb: 'Bonding and sealing',
    items: [
      'Fevicol / wood adhesive',
      'PVC adhesive',
      'Contact adhesive',
      'Epoxy',
      'Silicone sealant',
      'M-Seal',
      'Double-sided tape',
      'PVC tape',
      'Teflon tape',
      'Foam tape',
    ],
  },
  {
    title: 'Polish & Finishing',
    blurb: 'Melamine, PU, NC',
    items: [
      'Wood polish',
      'Melamine polish',
      'PU polish',
      'NC polish',
      'Wood stain',
      'Sanding sealer',
      'Primer',
      'Thinner',
      'Wood filler',
      'Putty',
      'Sandpaper',
      'Polish brushes',
      'Paint brushes',
      'Buffing compound',
    ],
  },
  {
    title: 'General Hardware',
    blurb: 'Shelf brackets, hooks and fittings',
    items: [
      'Hooks',
      'Chains',
      'S-hooks',
      'Door / window buffers',
      'Rubber stoppers',
      'Rubber beading',
      'PVC beading',
      'Aluminium profiles',
      'Aluminium channels',
      'Aluminium angles',
      'GI channels',
      'Brackets',
      'Clamps',
      'Rope',
      'Wire',
      'Springs',
    ],
  },
  {
    title: 'Kitchen Hardware',
    blurb: 'Pull-outs, baskets, hinges',
    items: [
      'Cabinet hinges',
      'Drawer channels',
      'Drawer baskets',
      'Cabinet handles',
      'Cabinet locks',
      'Magnetic catches',
      'Shelf supports',
      'Corner baskets',
      'Kitchen profile handles',
      'Aluminium profiles',
      'Bottle pull-outs',
      'Cutlery trays',
    ],
  },
  {
    title: 'Sheets, Mesh & Seals',
    blurb: 'Panels, jali, beading',
    items: [
      'PVC sheets',
      'Acrylic sheets',
      'Sunmica',
      'Decorative panels',
      'Wall panels',
      'Rubber sheets',
      'Foam sheets',
      'Aluminium jali',
      'Stainless-steel mesh',
      'GI mesh',
      'Rat-proof mesh',
      'Mosquito mesh',
      'Plastic mesh',
      'Door seals',
      'Window seals',
    ],
  },
];

/**
 * Total distinct product types carried across every category. Called "types"
 * rather than the trade's own word "lines", which reads as a stock-keeping term
 * to anyone outside the counter.
 */
export const TOTAL_TYPES = CATALOG.reduce((n, c) => n + c.items.length, 0);

/**
 * The shop really does split in two: things cut from timber, and things forged
 * from metal. The site's whole colour logic hangs off this — amber for the
 * wood side, cyan for the hardware side — so the palette carries information
 * instead of decoration.
 */
export type Family = 'timber' | 'metal';

const TIMBER: ReadonlySet<string> = new Set([
  'Ply & Boards',
  'Mica & Laminates',
  'Adhesives & Sealants',
  'Polish & Finishing',
]);

export const familyOf = (title: string): Family => (TIMBER.has(title) ? 'timber' : 'metal');
