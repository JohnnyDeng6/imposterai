import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'imposterai.game-packs.v1';
export const GAME_PACK_SIZE = 8;
const HISTORY_LIMIT = 40;

const emptyStore = () => ({ available: {}, used: {} });

const readStore = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return emptyStore();

    const parsed = JSON.parse(value);
    return {
      available: parsed.available || {},
      used: parsed.used || {},
    };
  } catch (error) {
    console.warn('Could not read saved game packs:', error);
    return emptyStore();
  }
};

const writeStore = (store) => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));

export const getPackCounts = async (category) => {
  const store = await readStore();
  return {
    available: store.available[category]?.length || 0,
    used: store.used[category]?.length || 0,
  };
};

export const takeSavedGame = async (category) => {
  const store = await readStore();
  const available = store.available[category] || [];
  if (available.length === 0) return null;

  const [game, ...remaining] = available;
  store.available[category] = remaining;
  store.used[category] = [game, ...(store.used[category] || [])].slice(0, HISTORY_LIMIT);
  await writeStore(store);
  return game;
};

export const reuseGamePack = async (category) => {
  const store = await readStore();
  const used = [...(store.used[category] || [])].sort(() => Math.random() - 0.5);
  if (used.length === 0) return null;

  const [game, ...remaining] = used;
  store.available[category] = remaining;
  store.used[category] = [game];
  await writeStore(store);
  return game;
};

export const saveGamePack = async (category, games) => {
  const store = await readStore();
  const existing = store.available[category] || [];
  const seen = new Set(existing.map(game => `${game.targetWord}\u0000${game.imposterWord}`));
  const newGames = games.filter((game) => {
    const key = `${game.targetWord}\u0000${game.imposterWord}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  store.available[category] = [...existing, ...newGames];
  await writeStore(store);
};
