// The platform destinations come from the original wiki's external resource directory.
export const ecosystem = [
  { label: 'Meitou', href: 'https://meitou.kenshi.wiki/', image: 'meitou' },
  { label: 'Map', href: 'https://map.kenshi.wiki/', glyph: 'map' },
  { label: 'WebFCS', href: 'https://web-fcs.kenshi.wiki/', glyph: 'webfcs' },
  { label: 'KenshiDB', href: 'https://kenshidb.wiki/', glyph: 'kenshidb' },
];

export const siteLinkGroups = [
  { label: 'Ecosystem', links: ecosystem },
  { label: 'Buy', links: [
    { label: 'Steam', href: 'https://store.steampowered.com/app/233860/Kenshi/', image: 'steam' },
    { label: 'GOG', href: 'https://www.gog.com/en/game/kenshi', image: 'gog' },
    { label: 'Humble Bundle', href: 'https://www.humblebundle.com/store/kenshi', image: 'humble-bundle' },
  ] },
  { label: 'Mods', links: [
    { label: 'Steam Workshop', href: 'https://steamcommunity.com/app/233860/workshop/', image: 'workshop' },
    { label: 'Nexus Mods', href: 'https://www.nexusmods.com/games/kenshi', image: 'nexus' },
  ] },
  { label: 'Community', links: [
    { label: 'Steam Forums', href: 'https://steamcommunity.com/app/233860/discussions/', image: 'steam-forums' },
    { label: 'r/Kenshi', href: 'https://www.reddit.com/r/Kenshi/', image: 'reddit' },
    { label: 'Discord', href: 'https://discord.gg/EYhrarkbh6', image: 'discord' },
  ] },
  { label: 'Official', links: [
    { label: 'Lo-Fi Games', href: 'https://lofigames.com/', image: 'lo-fi-games', publisher: true },
    { label: 'X', href: 'https://x.com/KenshiOfficial', image: 'x', iconOnly: true },
    { label: 'Facebook', href: 'https://www.facebook.com/OfficialKenshi/', image: 'facebook', iconOnly: true },
    { label: 'Instagram', href: 'https://www.instagram.com/lofigames/', image: 'instagram', iconOnly: true },
  ] },
];

export const platforms = siteLinkGroups.slice(1).flatMap(group => group.links);
