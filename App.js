import React, { useState } from 'react';
import { getTop200PopularAnimeClean, getTop200Characters, getLeagueCharacters, getTopMemes } from './api.js';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  StatusBar,
  Image,
  Pressable,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { PixelifySans_400Regular } from '@expo-google-fonts/pixelify-sans';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Utility: pause async execution for ms milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//roll a dice from 1-10, if 1, then no imposters mode
const noImpostersMode = () => {
  if (Math.floor(Math.random() * 10) === 1) {
    return true;
  } else {
    return false;
  }
}

const allImposterMode = () => {
  if (Math.floor(Math.random() * 10) === 1) {
    return true;
  } else {
    return false;
  }
}


// 'Anime Shows' and 'Anime Characters' are loaded dynamically from the API at game start.
const CATEGORIES = [
  'Anime Shows',
  'Anime Characters',
  'League of Legends',
  'TV Shows & Movies',
  'Animals',
  'Food',
  'Objects',
  'Computer Science',
  'Memes',
];

const WORD_DATABASE = {
  'TV Shows & Movies': [
    'Breaking Bad', 'Star Wars', 'The Office', 'Harry Potter', 'Stranger Things', 
    'Game of Thrones', 'The Sopranos', 'The Wire', 'Mad Men', 'Succession', 'Friends', 
    'Seinfeld', 'The Simpsons', 'South Park', 'Family Guy', 'SpongeBob SquarePants', 
    'Avatar: The Last Airbender', 'Rick and Morty', 'Doctor Who', 'Sherlock', 'Peaky Blinders', 
    'Black Mirror', 'The Crown', 'The Mandalorian', 'Iron Man', 'Captain America', 'Thor', 
    'Spider-Man', 'The Avengers', 'Batman', 'Superman', 'Wonder Woman', 'The Dark Knight', 
    'Inception', 'Interstellar', 'The Matrix', 'Neo', 'Lord of the Rings', 'Frodo Baggins', 
    'Gandalf', 'Aragorn', 'The Godfather', 'Pulp Fiction', 'Titanic', 'Jurassic Park', 
    'Jaws', 'E.T.', 'Back to the Future', 'Marty McFly', 'Indiana Jones', 'The Terminator', 
    'Alien', 'Predator', 'Die Hard', 'The Big Lebowski', 'Fight Club', 'Forrest Gump', 
    'The Shawshank Redemption', 'Gladiator', 'The Lion King', 'Simba', 'Darth Vader', 'Luke Skywalker'
  ],
  'Animals': [
    'Penguin', 'Elephant', 'Kangaroo', 'Octopus', 'Cheetah', 'Lion', 'Tiger', 'Bear', 
    'Wolf', 'Fox', 'Deer', 'Moose', 'Elk', 'Beaver', 'Raccoon', 'Squirrel', 'Rabbit', 
    'Hare', 'Mouse', 'Rat', 'Hamster', 'Guinea Pig', 'Chinchilla', 'Ferret', 'Hedgehog', 
    'Bat', 'Dolphin', 'Whale', 'Shark', 'Seal', 'Walrus', 'Manatee', 'Sea Turtle', 
    'Crocodile', 'Alligator', 'Snake', 'Lizard', 'Iguana', 'Chameleon', 'Frog', 'Toad', 
    'Salamander', 'Ostrich', 'Emu', 'Eagle', 'Hawk', 'Falcon', 'Owl', 'Parrot', 'Pigeon', 
    'Crow', 'Raven', 'Swan', 'Duck', 'Goose', 'Seagull', 'Pelican', 'Flamingo', 'Peacock', 
    'Chimpanzee', 'Gorilla', 'Orangutan', 'Monkey', 'Baboon', 'Lemur', 'Sloth', 'Armadillo'
  ],
  'Food': [
    'Pizza', 'Sushi', 'Taco', 'Hamburger', 'Ice Cream', 'Spaghetti', 'Macaroni and Cheese', 
    'Lasagna', 'Poutine', 'Maple Syrup', 'Bacon', 'Sausage', 'Hot Dog', 'Steak', 
    'Chicken Wings', 'Fried Chicken', 'French Fries', 'Onion Rings', 'Nachos', 'Burrito', 
    'Quesadilla', 'Enchilada', 'Fajita', 'Guacamole', 'Salsa', 'Hummus', 'Pita', 'Falafel', 
    'Shawarma', 'Kebab', 'Curry', 'Pad Thai', 'Ramen', 'Pho', 'Dumplings', 'Spring Rolls', 
    'Egg Rolls', 'Dim Sum', 'Fried Rice', 'Paella', 'Risotto', 'Gnocchi', 'Ravioli', 
    'Croissant', 'Baguette', 'Bagel', 'Doughnut', 'Muffin', 'Cupcake', 'Brownie', 'Cookie', 
    'Cake', 'Pie', 'Tart', 'Cheesecake', 'Pancake', 'Waffle', 'French Toast', 'Oatmeal', 
    'Cereal', 'Yogurt', 'Cheese', 'Butter', 'Apple', 'Banana', 'Orange', 'Strawberry', 'Grape'
  ],
  'Objects': [
    'Smartphone', 'Chair', 'Bicycle', 'Umbrella', 'Clock', 'Table', 'Desk', 'Sofa', 
    'Bed', 'Pillow', 'Blanket', 'Towel', 'Toothbrush', 'Toothpaste', 'Soap', 'Shampoo', 
    'Brush', 'Comb', 'Mirror', 'Scissors', 'Knife', 'Fork', 'Spoon', 'Plate', 'Bowl', 
    'Cup', 'Glass', 'Mug', 'Pan', 'Pot', 'Spatula', 'Whisk', 'Blender', 'Toaster', 
    'Microwave', 'Oven', 'Refrigerator', 'Television', 'Computer', 'Laptop', 'Keyboard', 
    'Mouse', 'Monitor', 'Printer', 'Camera', 'Headphones', 'Speaker', 'Microphone', 
    'Guitar', 'Piano', 'Drum', 'Violin', 'Flute', 'Trumpet', 'Saxophone', 'Book', 
    'Notebook', 'Pen', 'Pencil', 'Eraser', 'Ruler', 'Backpack', 'Suitcase', 'Wallet', 
    'Purse', 'Keys', 'Glasses', 'Sunglasses', 'Watch'
  ],
  'Computer Science': [
    'Algorithm', 'Variable', 'Data Type', 'Boolean', 'Array', 'Loop', 
    'Conditional Statement', 'Function', 'Syntax', 'Compiler', 'Interpreter', 
    'Bug', 'Debugging', 'String', 'Integer', 'Float', 'Recursion', 
    'Object', 'Class', 'Encapsulation', 'Inheritance', 'Polymorphism', 
    'Operating System', 'CPU', 'RAM', 'Binary', 'Byte', 'Bit', 'API', 
    'GUI', 'CLI', 'Version Control', 'Database', 'Stack', 'Queue', 
    'Linked List', 'Hash Table', 'Binary Search Tree', 'Graph', 
    'Big O Notation', 'Time Complexity', 'Space Complexity', 'Pointer', 
    'Dynamic Programming', 'Greedy Algorithm', 'Concurrency', 'Thread', 
    'Process', 'Deadlock', 'Race Condition', 'Mutex', 'Garbage Collection', 
    'REST API', 'SQL', 'NoSQL', 'Index', 'Normalization', 'DNS', 
    'IP Address', 'TCP/IP', 'HTTP', 'Socket', 'Cache', 'Virtual Machine', 
    'Containerization', 'Asynchronous', 'Abstraction', 'NP-Completeness', 
    'P vs NP', 'Halting Problem', 'Turing Machine', 'Abstract Syntax Tree', 
    'B-Tree', 'Red-Black Tree', 'Amortized Analysis', 'Cache Invalidation', 
    'Byzantine Fault Tolerance', 'Consensus Algorithm', 'CAP Theorem', 
    'MapReduce', 'Distributed Hash Table', 'Monad', 'Currying', 
    'Tail Call Optimization', 'LLVM', 'Zero-Knowledge Proof', 
    'Homomorphic Encryption', 'Cache Coherence', 'Branch Prediction', 
    'Instruction Pipelining', 'Memory Barrier', 'Out-of-Order Execution', 
    'Page Fault', 'Translation Lookaside Buffer', 'Static Analysis', 
    'Vectorization', 'Bloom Filter', 'A* Search', 'Transformer', 'Backpropagation'
  ]
};

const getPromptForCategory = (category, targetWord) => {
  let taskLogic = '';
  switch(category) {
    case 'Anime Shows':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *World-Building:* A prominent physical setting, architecture, or environment unique to the show's universe.\n  - *Iconic Prop/MacGuffin:* A tangible, non-magical item that drives the plot or is heavily featured.\n  - *Genre Trope:* A universally recognized physical action or situation common to this specific type of anime (e.g., mecha, slice-of-life).\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm. Strictly avoid metaphors.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Anime Characters':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Signature Accessory:* A specific piece of clothing, weapon, or gear the character always wears/uses.\n  - *Physical Trademark:* A concrete physical trait, hair style, or recurring physical posture.\n  - *Parallel Archetype:* A tangible profession or real-world title that matches their role (e.g., "Soldier" instead of "Fighter").\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm. Strictly avoid abstract feelings, metaphors, or obscure training methods.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'TV Shows & Movies':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Set Design:* A defining piece of furniture, vehicle, or architectural style heavily featured on screen.\n  - *Occupational Tool:* A physical object related to the main characters' jobs or daily routines.\n  - *Atmospheric Noun:* A tangible item that captures the visual tone (e.g., "Trenchcoat" for noir, "Stethoscope" for medical).\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm. Strictly avoid metaphors.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Animals':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 2-4/10. (Keep it tighter, animals are literal).\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Anatomical Quirk:* A specific, defining body part or physical adaptation (e.g., "Pouch", "Tusk").\n  - *Habitat/Diet:* A specific geographic feature they live in or a primary food source.\n  - *Behavioural Verb:* A specific, distinct physical action they are famous for (e.g., "Burrowing", "Gliding").\n4. **Selection:** Pick the single most clever, tangible noun or verb from your brainstorm.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Food':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 2-4/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Raw Ingredient:* A foundational component before it is cooked.\n  - *Preparation Tool:* A specific kitchen utensil, appliance, or dishware required to make or eat it.\n  - *Physical Texture/Shape:* A noun describing its geometry or mouthfeel (e.g., "Triangle", "Crunch").\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm. Strictly avoid the feeling of eating it.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'League of Legends':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations (role, class, signature ability). You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Signature Weapon/Item:* A specific physical weapon, tool, or iconic item the champion wields.\n  - *Thematic Origin:* A tangible place, culture, or environment the champion comes from (e.g., "Piltover", "Noxus").\n  - *Parallel Profession:* A real-world job or archetype that mirrors their role (e.g., "Bounty Hunter", "Judge").\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm. Strictly avoid ability names and stat terms.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Objects':
      taskLogic = `1. **Banned List:** Identify the 3 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 2-4/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Material Composition:* What it is primarily built from (e.g., "Glass", "Mahogany").\n  - *Environmental Context:* The specific room or localized setting where it is permanently kept.\n  - *Complementary Item:* The physical thing it is designed to hold, clean, power, or interact with.\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Computer Science':
      taskLogic = `1. **Banned List:** Identify the 1 most obvious, immediate associations. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Core Concept:* A foundational principle, architecture, or paradigm.\n  - *Real-world Analogy:* A physical or everyday process that mirrors how this CS concept operates.\n  - *Related Tool/System:* A common hardware component, system, or practical application associated with it.\n4. **Selection:** Pick the single most clever, tangible noun or phrase from your brainstorm.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
    case 'Memes':
      taskLogic = `1. **Banned List:** Identify the 1 most obvious, immediate associations with this meme. You cannot use these or their direct synonyms.\n2. **Semantic Target:** 3-5/10.\n3. **Divergent Lenses:** Brainstorm one potential clue for each:\n  - *Visual Element:* A specific background object, clothing item, or visual detail from the meme format.\n  - *Core Emotion:* A physical reaction or tangible object representing the feeling of the meme.\n  - *Format Structure:* A word describing the layout (e.g., "Two-panel", "Overlay").\n4. **Selection:** Pick the single most clever, tangible noun from your brainstorm.\n5. **Verification:** Ensure the word is not on the Banned List and requires an "aha!" realization, not an instant link.`;
      break;
  }
  return `**System:** You are an expert AI game designer. Generate a creative, lateral-thinking imposter clue for a hidden word game. The word must be tangentially related but cleverly obscure.

**Task:** Execute the following reasoning steps sequentially:
${taskLogic}

**Input:**
Category: ${category}
Target Word: ${targetWord}

**Output:** Output exactly: "Final Word: [Your Word]"`;
};

// --- CUSTOM PIXEL COMPONENT ---
const PixelButton = ({ imageUp, imageDown, onPress, disabled, style, children, onLongPress, delayLongPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => {
        if (!disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsPressed(true);
        }
      }}
      onPressOut={() => setIsPressed(false)}
      onPress={!disabled ? onPress : null}
      onLongPress={!disabled ? onLongPress : null}
      delayLongPress={delayLongPress}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <ImageBackground
        source={isPressed ? imageDown : imageUp}
        style={styles.pixelImageBase}
        resizeMode="stretch"
      >
        {children}
      </ImageBackground>
    </Pressable>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({ 'Pixelify Sans': PixelifySans_400Regular });

  const [gameState, setGameState] = useState('lobby'); 
  const [players, setPlayers] = useState([]);
  const [tempName, setTempName] = useState('');
  const [tempImage, setTempImage] = useState(null);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imposterId, setImposterId] = useState(null);
  const [targetWord, setTargetWord] = useState('');
  const [targetWordImage, setTargetWordImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imposterWord, setImposterWord] = useState('');
  
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [shuffledPlayers, setShuffledPlayers] = useState([]);
  const [firstPlayerId, setFirstPlayerId] = useState(null);
  const [selectedVoteId, setSelectedVoteId] = useState(null);

  const [loadingProgress, setLoadingProgress] = useState('');

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setTempImage(result.assets[0].uri);
  };

  const addPlayer = () => {
    if (!tempName.trim()) return;
    if (players.length >= 12) return Alert.alert('Max Players Reached');
    setPlayers([...players, {
      id: Date.now().toString(),
      name: tempName.trim(),
      uri: tempImage || 'https://ui-avatars.com/api/?name=' + tempName.trim() + '&background=333&color=fff'
    }]);
    setTempName('');
    setTempImage(null);
  };

  const removePlayer = (id) => setPlayers(players.filter(p => p.id !== id));
  
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) setSelectedCategories(selectedCategories.filter(c => c !== cat));
    else setSelectedCategories([...selectedCategories, cat]);
  };

  const startGameLogic = async () => {

    if (selectedCategories.length === 0) return Alert.alert('Select Category');
    setGameState('loading');

    setLoadingProgress('selecting imposter...');

    // deciding who imposter mode and who is imposter
    const newImposterId = noImpostersMode() ? null : players[Math.floor(Math.random() * players.length)].id;
    setImposterId(newImposterId);
    await delay(500);
 

    setLoadingProgress('selecting category...');
    const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
    setSelectedCategory(randomCategory);

    let randomWord = '';
    let wordImage = null;

    try {
      if (randomCategory === 'Anime Shows') {
        const animeList = await getTop200PopularAnimeClean();
        const pick = animeList[Math.floor(Math.random() * animeList.length)];
        randomWord = pick.title;
        wordImage = pick.cover;
      } else if (randomCategory === 'Anime Characters') {
        const charList = await getTop200Characters();
        const pick = charList[Math.floor(Math.random() * charList.length)];
        randomWord = pick.name;
        wordImage = pick.image;
      } else if (randomCategory === 'League of Legends') {
        const champList = await getLeagueCharacters();
        const pick = champList[Math.floor(Math.random() * champList.length)];
        randomWord = pick.name;
        wordImage = pick.image;
      } else if (randomCategory === 'Memes') {
        const memesList = await getTopMemes();
        const pick = memesList[Math.floor(Math.random() * memesList.length)];
        randomWord = pick.name;
        wordImage = pick.image;
      } else {
        const wordsInCat = WORD_DATABASE[randomCategory];
        randomWord = wordsInCat[Math.floor(Math.random() * wordsInCat.length)];
      }
    } catch (err) {
      Alert.alert('API Error', err.message);
      setGameState('category');
      return;
    }

    setTargetWord(randomWord);
    setTargetWordImage(wordImage);

    const promptText = getPromptForCategory(randomCategory, randomWord);

    setLoadingProgress('generating imposter word...');

    if (newImposterId !== null) {
      // There IS an imposter — generate a fake clue word for them via AI
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'o3',
            messages: [{ role: 'user', content: promptText }]
          }),
        });

        const data = await response.json();
        const fullResponse = data.choices[0].message.content;
        const match = fullResponse.match(/Final Word:\s*(.*)/i);

        setImposterWord(match ? match[1].trim() : 'Error (Fallback)');
      } catch (error) {
        console.error("OpenAI Fallback Triggered:", error);
        Alert.alert('API Error 🚨', `Could not generate word via OpenAI.\nReason: ${error.message}`);
        setGameState('category');
        return;
      }
    } else {
      // No-imposters mode, give everyone a 5s buffer on the loading screen
      await delay(5000);
      setImposterWord('');
    }

    setRevealIndex(0);
    setIsRevealed(false);
    setGameState('reveal');
  };

  const nextPlayerReveal = () => {
    if (revealIndex < players.length - 1) {
      setRevealIndex(revealIndex + 1);
      setIsRevealed(false);
    } else {
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      setShuffledPlayers(shuffled);
      setFirstPlayerId(shuffled[Math.floor(Math.random() * shuffled.length)]?.id);
      setSelectedVoteId(null);
      setGameState('play');
    }
  };

  const resetToCategories = () => {
    setSelectedCategories([]);
    setGameState('category');
  };

  const returnToLobby = () => setGameState('lobby');

  // --- RENDERERS ---
  const renderLobby = () => (
    <View style={styles.phaseContainer}>
      <ImageBackground source={require('./assets/ui_panel.png')} style={styles.pixelCard} resizeMode="stretch">
        <Text style={[styles.pixelTitle, {fontSize: 30}]}>IMPOSTER AI</Text>
        <Text style={styles.pixelText}>{players.length}/12 Players</Text>
      </ImageBackground>

      <ImageBackground source={require('./assets/ui_panel.png')} style={styles.pixelCard} resizeMode="stretch">
        <View style={styles.inputWrapper}>
          <ImageBackground source={require('./assets/input_field.png')} style={styles.inputBg} resizeMode="stretch">
            <TextInput
              style={styles.input}
              placeholder="Name..."
              placeholderTextColor="#777"
              value={tempName}
              onChangeText={setTempName}
              caretHidden={true}
            />
          </ImageBackground>
        </View>
        <View style={styles.inputButtonRow}>
          <PixelButton
            imageUp={require('./assets/btn_square_camera_up.png')}
            imageDown={require('./assets/btn_square_camera_down.png')}
            onPress={takePicture}
            style={styles.iconButton}
          >
            {tempImage ? <Image source={{ uri: tempImage }} style={styles.iconPreview} /> : <Text style={styles.pixelTextSmall}></Text>}
          </PixelButton>
          <PixelButton
            imageUp={require('./assets/btn_square_plus_up.png')}
            imageDown={require('./assets/btn_square_plus_down.png')}
            onPress={addPlayer}
            style={styles.addButton}
          >
          </PixelButton>
        </View>
      </ImageBackground>

      <ScrollView style={{ flex: 1, marginBottom: 100 }}>
        {players.map((p) => (
          <ImageBackground key={p.id} source={require('./assets/ui_panel.png')} style={styles.playerRow} resizeMode="stretch">
            <Image source={{ uri: p.uri }} style={styles.playerListIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pixelText}>{p.name}</Text>
            </View>
            <Pressable onPress={() => removePlayer(p.id)} style={styles.removeButton}>
              <Image source={require('./assets/x_cancel.png')} style={styles.cancelIcon} resizeMode="contain" />
            </Pressable>
          </ImageBackground>
        ))}
      </ScrollView>

      <View style={styles.bottomDock}>
        <PixelButton 
          imageUp={require('./assets/btn_long_up.png')} 
          imageDown={require('./assets/btn_long_down.png')}
          disabled={players.length < 3}
          onPress={() => setGameState('category')}
          style={styles.mainButton}
        >
          <Text style={styles.pixelButtonText}>CONTINUE</Text>
        </PixelButton>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.pageHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to players"
          onPress={returnToLobby}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backButtonText}>{'\u2039 BACK'}</Text>
        </Pressable>
        <Text style={[styles.pixelTitle, styles.pageTitle]}>Select Categories</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategories.includes(cat);
            return (
              <Pressable key={cat} onPress={() => toggleCategory(cat)} style={styles.pillContainer}>
                <ImageBackground 
                  source={isActive ? require('./assets/pill_on.png') : require('./assets/pill_off.png')} 
                  style={styles.pixelImageBase} 
                  resizeMode="stretch"
                >
                  <Text style={styles.pixelTextSmall}>{cat}</Text>
                </ImageBackground>
              </Pressable>
            );
          })}
          
          <Pressable onPress={() => {
            if (selectedCategories.length === CATEGORIES.length) {
              setSelectedCategories([]);
            } else {
              setSelectedCategories([...CATEGORIES]);
            }
          }} style={styles.pillContainer}>
            <ImageBackground 
              source={selectedCategories.length === CATEGORIES.length ? require('./assets/pill_on.png') : require('./assets/pill_off.png')} 
              style={styles.pixelImageBase} 
              resizeMode="stretch"
            >
              <Text style={styles.pixelTextSmall}>Select All</Text>
            </ImageBackground>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomDock}>
        <PixelButton 
          imageUp={require('./assets/btn_long_up.png')} 
          imageDown={require('./assets/btn_long_down.png')}
          disabled={selectedCategories.length === 0}
          onPress={startGameLogic}
          style={styles.mainButton}
        >
          <Text style={styles.pixelButtonText}>START GAME</Text>
        </PixelButton>
      </View>
    </View>
  );

  const renderReveal = () => {
    const currentPlayer = players[revealIndex];
    if (!currentPlayer) return null;
    const isImposter = currentPlayer.id === imposterId;

    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.pixelText, { color: '#FFF' }]}>Pass phone to:</Text>
        <Image source={{ uri: currentPlayer.uri }} style={[styles.revealAvatar, { color: '#FFF' }]} />
        <Text style={[styles.pixelTitle, { color: '#FFF' }]}>{currentPlayer.name}</Text>

        <ImageBackground source={require('./assets/ui_panel.png')} style={styles.revealBox} resizeMode="stretch">
          {!isRevealed ? (
            <PixelButton
              imageUp={require('./assets/btn_long_up.png')}
              imageDown={require('./assets/btn_long_down.png')}
              delayLongPress={500}
              onLongPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsRevealed(true);
              }}
              style={styles.holdButton}
            >
              <Text style={styles.pixelButtonText}>HOLD</Text>
            </PixelButton>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.pixelTitle, { color: isImposter ? '#FF453A' : '#07661fb5' }]}>
                {isImposter ? 'IMPOSTER' : 'INNOCENT'}
              </Text>
              <Text style={[styles.pixelText, { fontSize: 20}]}>{isImposter ? imposterWord : targetWord}</Text>
              {!isImposter && targetWordImage && (
                <Image
                  source={{ uri: targetWordImage }}
                  style={styles.wordImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        </ImageBackground>

        {isRevealed && (
          <View style={styles.bottomDock}>
            <PixelButton 
              imageUp={require('./assets/btn_long_up.png')} 
              imageDown={require('./assets/btn_long_down.png')}
              onPress={nextPlayerReveal}
              style={styles.mainButton}
            >
              <Text style={styles.pixelButtonText}>HIDE & NEXT</Text>
            </PixelButton>
          </View>
        )}
      </View>
    );
  };

  const renderPlay = () => (
    <View style={styles.phaseContainer}>
      <Text style={[styles.pixelTitle, { color: '#FFF' }]}>Vote Imposter</Text>
      
      <ScrollView contentContainerStyle={styles.playGrid}>
        {shuffledPlayers.map(p => {
          const isFirst = p.id === firstPlayerId;
          const isSelected = p.id === selectedVoteId;
          
          let frameImage = require('./assets/frame_normal.png');
          if (isSelected) frameImage = require('./assets/frame_vote.png'); // Add this PNG if not already extracted
          else if (isFirst) frameImage = require('./assets/frame_first.png');

          return (
            <Pressable key={p.id} onPress={() => setSelectedVoteId(p.id)} style={styles.playCard}>
              <ImageBackground source={frameImage} style={styles.pixelImageBase} resizeMode="stretch">
                <Image source={{ uri: p.uri }} style={styles.playAvatar} />
                <Text style={styles.pixelTextSmall}>{p.name}</Text>
              </ImageBackground>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bottomDock}>
        <PixelButton 
          imageUp={require('./assets/btn_long_up.png')} 
          imageDown={require('./assets/btn_long_down.png')}
          disabled={!selectedVoteId}
          onPress={() => setGameState('end')}
          style={styles.mainButton}
        >
          <Text style={styles.pixelButtonText}>VOTE</Text>
        </PixelButton>
      </View>
    </View>
  );

  const renderEnd = () => {
    const imposterCaught = selectedVoteId === imposterId;
    const imposterPlayer = players.find(p => p.id === imposterId);
    
    return (
      <View style={[styles.phaseContainer, { alignItems: 'center', paddingTop: 60 }]}>
        <Text style={[styles.pixelTitle, { fontSize: 30, color: imposterCaught ? '#30D158' : '#FF453A' }]}>
          {imposterCaught ? 'INNOCENTS WIN' : 'IMPOSTER WINS'}
        </Text>
        <Text style={[styles.pixelText, { color: '#FFF', fontSize: 20 }]}>Word: {targetWord}</Text>
        {targetWordImage && (
          <Image
            source={{ uri: targetWordImage }}
            style={styles.wordImageLarge}
            resizeMode="cover"
          />
        )}

        <Image source={{ uri: imposterPlayer?.uri }} style={[styles.revealAvatar, { borderColor: '#FF453A', borderWidth: 4 }]} />
        <Text style={[styles.pixelTitle, { color: '#FFF' }]}>{imposterPlayer?.name}</Text>
        <Text style={[styles.pixelText, { color: '#FFF', fontSize: 20 }]}>Imposter (Clue: {imposterWord})</Text>

        <View style={styles.bottomDockMulti}>
          <PixelButton 
            imageUp={require('./assets/btn_long_up.png')} 
            imageDown={require('./assets/btn_long_down.png')}
            onPress={resetToCategories}
            style={[styles.mainButton, { flex: 1, marginRight: 5 }]}
          >
            <Text style={styles.pixelButtonText}>PLAY AGAIN</Text>
          </PixelButton>
          <PixelButton 
            imageUp={require('./assets/btn_long_up.png')} 
            imageDown={require('./assets/btn_long_down.png')}
            onPress={returnToLobby}
            style={[styles.mainButton, { flex: 1, marginLeft: 5 }]}
          >
            <Text style={styles.pixelButtonText}>EXIT</Text>
          </PixelButton>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
          {gameState === 'lobby' && renderLobby()}
          {gameState === 'category' && renderCategories()}
          {gameState === 'loading' && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={[styles.pixelTitle, { color: '#FFF', marginTop: 20 }]}>LOADING...</Text>
              {loadingProgress ? (
                <Text style={[styles.pixelText, { color: '#AAA', marginTop: 8 }]}>{loadingProgress}</Text>
              ) : null}
            </View>
          )}
          {gameState === 'reveal' && renderReveal()}
          {gameState === 'play' && renderPlay()}
          {gameState === 'end' && renderEnd()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// --- PIXEL ART STYLES ---
const pixelFont = 'Pixelify Sans';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  phaseContainer: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageHeader: { marginBottom: 4 },
  pageTitle: { fontSize: 30, color: '#FFF', textAlign: 'center', marginBottom: 0 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 },
  backButtonPressed: { opacity: 0.6 },
  backButtonText: { fontFamily: pixelFont, fontSize: 16, color: '#FFF' },
  
  // Typography
  pixelTitle: { fontFamily: pixelFont, fontSize: 20, color: '#000', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, marginBottom: 10 },
  pixelText: { fontFamily: pixelFont, fontSize: 14, color: '#000', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  pixelTextSmall: { fontFamily: pixelFont, fontSize: 10, color: '#000' },
  pixelErrorText: { fontFamily: pixelFont, fontSize: 16, color: '#FF453A' },
  pixelButtonText: { fontFamily: pixelFont, fontSize: 18, color: '#000', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, textAlign: 'center' },

  // Base Pixel Component - Ensure all use contain
  pixelImageBase: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  
  // Panels (ui_panel.png is 256x128 -> Ratio 2:1)
  pixelCard: { width: '100%', aspectRatio: 2, paddingLeft: 0, paddingRight: 0, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  
  // Input Field (input_field.png is 256x128 -> Ratio 2:1)
  inputWrapper: { width: '85%', alignSelf: 'center', marginBottom: 10 },
  inputBg: { width: '100%', height: 60, justifyContent: 'center', overflow: 'hidden' },
  input: { width: '100%', height: 60, fontFamily: pixelFont, color: '#000', paddingHorizontal: 15, fontSize: 14, textAlign: 'center' },

  // Row for camera + add buttons below the input
  inputButtonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  
  // Square Buttons (64x64 -> Ratio 1:1)
  iconButton: { height: 55, aspectRatio: 1 },
  iconPreview: { width: '70%', height: '70%' }, 
  addButton: { height: 55, aspectRatio: 1 },
  
  // Player Rows
  playerRow: { width: '80%', aspectRatio: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, marginHorizontal: 20, marginBottom: 10 },
  playerListIcon: { width: 36, height: 36, marginRight: 15 },
  removeButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  cancelIcon: { width: 28, height: 28 },

  // Categories & Pills (256x128 -> Ratio 2:1)
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 20, justifyContent: 'center' },
  pillContainer: { width: '45%', aspectRatio: 2, paddingHorizontal: 5 },

  // Reveal Phase
  revealAvatar: { width: 100, height: 100, marginVertical: 20, borderWidth: 4, borderColor: '#000' },
  revealBox: { width: '100%', aspectRatio: 2, marginTop: 20, justifyContent: 'center', alignItems: 'center', },
  wordImage: { width: 80, height: 80, marginTop: 8, borderRadius: 8, borderWidth: 2, borderColor: '#07661fb5' },
  wordImageLarge: { width: 120, height: 120, marginVertical: 10, borderRadius: 10, borderWidth: 3, borderColor: '#FFF' },
  
  // Long Buttons (256x128 -> Ratio 2:1)
  holdButton: { width: '60%', aspectRatio: 4 },
  mainButton: { width: '100%', aspectRatio: 4, marginBottom: -50 }, // Scaled down vertically for dock

  // Play Phase (Frames are 128x128 -> Ratio 1:1)
  playGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 100 },
  playCard: { width: '45%', aspectRatio: 1, marginBottom: 15 },
  playAvatar: { width: '50%', height: '50%', marginBottom: 5, marginTop: 5 },

  // Docking
  bottomDock: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  bottomDockMulti: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
});
