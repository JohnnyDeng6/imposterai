# ImposterAI

<div align="center">
  <img src="assets/icon.png" width="128" alt="ImposterAI icon" />
</div>

A pass-and-play imposter party game for Android and iOS, built with Expo and
React Native. One secret word is dealt to everyone; one random player (or none)
is the imposter and receives an AI-generated decoy word instead. After a
reveal pass, players give one-word clues around the table and vote on who the
imposter is.

## How it works

1. **Lobby**: add up to 12 players by name, with an optional camera photo
   (via `expo-image-picker`) as avatar.
2. **Category**: pick one or more of nine categories.
3. **Reveal**: each player privately taps to see their word (or imposter clue).
4. **Play**: the game randomly orders players and names a first player.
5. **Vote**: select a suspect and reveal the outcome: innocents win if the
   imposter is caught, otherwise the imposter wins.

Two hidden twists: there is a 1-in-10 chance a round has no imposter at all.

## Word sources

| Category | Source |
| --- | --- |
| Anime Shows | [AniList GraphQL API](https://docs.anilist.co), top 200 by popularity, deduplicated |
| Anime Characters | AniList, top 200 by favorites |
| League of Legends | [Data Dragon](https://developer.riotgames.com/docs/lol), champions by latest patch |
| Memes | [Imgflip](https://imgflip.com) `get_memes` |
| TV Shows & Movies, Animals, Food, Objects, Computer Science | Built-in word lists |

For imposter rounds, the game sends the target word and a category-specific
prompt to the OpenAI API (`o3`), which generates a decoy word designed to be
plausible but hard to give clues for. Categories carry custom prompt rules
(banned associations, semantic difficulty target, divergent brainstorm lenses).

## Running

```sh
npm install
EXPO_PUBLIC_OPENAI_API_KEY=<key> npx expo start --tunnel
```

Press `a` for Android or `i` for iOS, or scan the QR code with Expo Go. The
`--tunnel` flag routes the dev server through ngrok so devices on other
networks can connect.
The OpenAI key is only required when an imposter is dealt.

Builds are managed with [EAS](eas.json): `eas build` for development,
preview (APK), and production profiles.

## Stack

- Expo SDK 54, React Native 0.81, React 19
- `expo-font` with the Pixelify Sans typeface
- `expo-haptics` for button feedback
- Pixel-art UI assembled from the 9-slice PNG assets in `assets/`
