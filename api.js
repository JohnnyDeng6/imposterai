/**
 * API: Anime Fetch + Clean (Anilist + League)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTop200PopularAnimeClean() {
  const raw = [];

  for (let page = 1; page <= 4; page++) {
    const query = `
      query {
        Page(page: ${page}, perPage: 50) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            title { english romaji }
            coverImage { large }
          }
        }
      }
    `;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error(`Anime fetch failed on page ${page}`);
    const json = await res.json();
    raw.push(...(json.data.Page.media || []));
    await delay(300);
  }

  const exactSeen = new Set();
  const cleaned = [];

  function normalizeWhitespace(str) {
    return str.replace(/\s+/g, " ").trim();
  }

  function normalizeForDuplicateCheck(title) {
    return normalizeWhitespace(
      title
        .toLowerCase()
        .replace(/\bpart\b/gi, "")
        .replace(/\bseason\b/gi, "")
        .replace(/\b(ova|ona|special)\b/gi, "")
        .replace(/\b(ii|iii|iv|v|vi|vii|viii|ix|x)\b/gi, "")
        .replace(/\b[2-5]\b/g, "")
        .replace(/[:\-–—]\s*.*$/g, "")
    );
  }

  for (const m of raw) {
    const title = m.title.english || m.title.romaji;
    const cover = m.coverImage?.large;

    if (!title || !cover) continue;

    const dedupeKey = normalizeForDuplicateCheck(title);
    if (!dedupeKey) continue;
    if (exactSeen.has(dedupeKey)) continue;
    exactSeen.add(dedupeKey);

    cleaned.push({ title, cover });
  }

  return cleaned;
}

export async function getTop200Characters() {
  const results = [];

  for (let page = 1; page <= 4; page++) {
    const query = `
      query {
        Page(page: ${page}, perPage: 50) {
          characters(sort: FAVORITES_DESC) {
            name { full }
            image { large }
          }
        }
      }
    `;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error(`Characters fetch failed on page ${page}`);
    const json = await res.json();
    results.push(...(json.data.Page.characters || []));
    await delay(300);
  }

  return results.map(char => ({
    name: char.name.full,
    image: char.image?.large
  }));
}

export async function getLeagueCharacters() {
  const versionRes = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );

  if (!versionRes.ok) {
    throw new Error(`Failed to fetch versions: ${versionRes.status}`);
  }

  const [latestVersion] = await versionRes.json();

  const champsRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
  );

  if (!champsRes.ok) {
    throw new Error(`Failed to fetch champions: ${champsRes.status}`);
  }

  const { data } = await champsRes.json();

  return Object.values(data).map(champ => ({
    name: champ.name,
    image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`
  }));
}

export async function getTopMemes() {
  const res = await fetch("https://api.imgflip.com/get_memes");
  if (!res.ok) {
    throw new Error(`Failed to fetch memes: ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(`Imgflip API error`);
  }
  return json.data.memes.map(meme => ({
    name: meme.name,
    image: meme.url
  }));
}