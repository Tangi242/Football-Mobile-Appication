const fileMap = import.meta.glob('../../../assets/images/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default'
});

const entries = Object.entries(fileMap);

const fallbackAsset = (filename) => {
  if (!entries.length) return '';
  const hash = [...filename].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return entries[Math.abs(hash) % entries.length][1];
};

export const getAssetUrl = (filename) => {
  if (!filename) return entries[0]?.[1] || '';
  const entry = entries.find(([key]) => key.endsWith(`/${filename}`));
  return entry ? entry[1] : fallbackAsset(filename);
};

