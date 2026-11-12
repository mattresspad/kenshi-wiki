import { existingPaths } from './categories.js';
import { wiki } from './wiki.js';

// Each card heads with a hub page and lists links as 'Title' or ['Label', 'Title']; a title may be a 'Category:'.
// image names a picture in public/images/kenshi/main-page/, a screenshot or a cutout game icon; a card without one
// shows its emoji icon.
const sections = [
  {
    title: 'Concepts',
    cards: [
      { title: 'Basics', image: 'basics.webp', icon: '📖', page: 'Controls', links: ['Controls', 'Game Starts', ['Skills', 'Statistics'], ['Lore', 'Category:Lore'], 'Guides', ['Events', 'Category:Events']] },
      { title: 'Gameplay', image: 'gameplay.webp', icon: '🎒', page: ['Gameplay overview', 'Gameplay'], links: ['Stealth', 'Thievery', 'Assassination', 'Bounty', 'Slavery', ['Money', 'Cats']] },
      { title: 'Extras', image: 'extras.webp', icon: '🛠️', page: 'Mods', links: ['Mods', 'Forgotten Construction Set', 'Modding', ['Modding guides', 'Category:Modding Guide'], ['Removed content', 'Category:Removed Content']] },
      { title: 'Skills', image: 'skills.webp', icon: '⚔️', page: 'Statistics', links: ['Martial Arts', 'Strength', 'Dexterity', 'Toughness', 'Athletics', 'Swimming'] },
      { title: 'World', image: 'world.webp', icon: '🌍', page: 'World of Kenshi', links: [['Map', 'World of Kenshi'], 'Major Towns', ['Zones', 'Category:Zones'], ['Locations', 'Category:Locations'], 'Ancient Ruins', 'World States'] },
    ],
  },
  {
    title: 'Items',
    cards: [
      { title: 'Gear', image: 'gear.png', cutout: true, icon: '🗡️', page: 'Equipment', links: ['Weapons', 'Armour', 'Clothing', 'Backpacks', 'Robot Limbs', ['Crossbows', 'Category:Crossbows']] },
      { title: 'Armour', image: 'armour.png', cutout: true, icon: '🛡️', page: 'Armour', links: ['Light Armour', 'Medium Armour', 'Heavy Armour', 'Headgear', 'Body Armour', 'Shirts', 'Legwear', 'Footwear'] },
      { title: 'Resources', image: 'resources.webp', icon: '📦', page: 'Items', links: ['Items', 'Food', ['Nutrition', 'Category:Nutrition'], ['Books', 'Book'], 'Artifacts', 'AI Core'] },
      { title: 'Technology', image: 'technology.webp', icon: '⚙️', page: 'Technology', links: ['Technology', 'Blueprints', 'Robotics', 'Crafting', 'Cooking'] },
      {
        title: 'Building',
        image: 'building.webp',
        icon: '🏚️',
        page: 'Construction',
        links: [['Construction', 'Construction'], ['Buildings', 'Category:Buildings'], 'Farming', 'Power', 'Storage', 'Turrets', 'Water', 'Copper'],
      },
    ],
  },
  {
    title: 'Life',
    cards: [
      {
        title: 'Characters',
        image: 'characters.webp',
        icon: '🧍',
        page: 'Category:Characters',
        links: [['All characters', 'Category:Characters'], ['Unique NPCs', 'Category:Unique'], ['Bosses', 'Category:Bosses'], 'Traders', ['Vendors', 'Category:Vendors'], ['Nobles', 'Category:Nobles']],
      },
      { title: 'Races', image: 'races.webp', icon: '🧬', page: 'Races', links: ['Greenlander', 'Scorchlander', 'Shek', 'Hive', 'Skeleton'] },
      { title: 'Factions', image: 'factions.webp', icon: '🏳️', page: 'Factions', links: ['The Holy Nation', 'United Cities', 'Shek Kingdom', 'Tech Hunters', 'Shinobi Thieves', 'Slave Traders'] },
      { title: 'Fauna', image: 'fauna.webp', icon: '🦎', page: 'Fauna', links: ['Fauna', ['Animals', 'Category:Animals'], 'Wildlife'] },
    ],
  },
];

async function resolveDirectory() {
  const existing = await existingPaths();
  function resolve(link) {
    const [label, title] = Array.isArray(link) ? link : [link, link];
    const href = wiki(title);
    if (existing.has(href)) return { label, href };
    console.warn(`Wiki directory: "${title}" has no page; omitting link.`);
    return null;
  }

  return sections.map(section => ({
    ...section,
    cards: section.cards.map(card => {
      const hub = resolve(card.page);
      const links = card.links.map(resolve).filter(Boolean);
      const browseLinks = hub && !links.some(link => link.href === hub.href) ? [hub, ...links] : links;
      return { ...card, href: hub?.href, links, browseLinks };
    }),
  }));
}

// Share even an in-flight lookup between concurrent static pages. In dev, pick up content edits.
let buildDirectory;
export function topicDirectory() {
  if (import.meta.env.DEV) return resolveDirectory();
  return buildDirectory ??= resolveDirectory();
}
