# Solo D&D Experiment

An immersive, browser-based Solo Dungeons & Dragons experience powered by the Gemini 2.5 Flash API. This project strips away the cumbersome mechanics of digital mapping tools to focus strictly on what makes role-playing games magical: storytelling, statistical character representation, and the thrill of rolling the dice.

![Solo D&D UI Preview](assets/preview.png) *(Preview of the D&D Beyond inspired UI)*

## Features

- **D&D Beyond Integration**: Seamlessly import your 2024 generated character JSON files straight from D&D Beyond. The application automatically maps your ability scores, computes your modifiers, max HP, and Armor Class, and displays it in a beautifully styled, screen-native Character Sheet.
- **AI Dungeon Master**: Hook up your Google Gemini API key to summon an incredibly perceptive, lore-accurate DM. It manages the campaign, roleplays NPCs, and correctly halts the narrative to demand exactly the right d20 skill checks and attack rolls.
- **Native SVG Tumbling Dice**: No clunky, resource-heavy WebGL renderers. Includes a fully custom, mathematically-drawn suite of SVG dice (d4, d6, d8, d10, d12, d20). When instructed to roll, beautiful translucent 3D-styled SVGs physically tumble and crash into the center of your screen via advanced CSS animations, automatically injecting the result directly into your action input.
- **Persistent State**: The client utilizes local browser storage to confidently remember your Gemini API key and D&D Beyond JSON string. You'll never have to repeatedly import your character every time you refresh the page.
- **Dark Fantasy UI**: A high-end `<canvas>`-free user interface deeply inspired by official D&D sourcebooks and D&D Beyond elements.

## Getting Started

1. **Clone the repo**: `git clone git@github.com:mr31labs/solo-D-D-experiment.git`
2. **Open `index.html`** in your browser of choice. No complex Node.js bundling or compilation required! 
3. **Bring a Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and insert it when the modal prompts you.
4. **Bring a Character**: Export your character JSON from D&D Beyond, click "Import Stats", and let the adventure begin.

## Why D&D is profound for Creative Writing and Mental Health

Dungeons & Dragons has long been stereotyped as a simple game of math and miniatures. But stripped to its core, especially in a solo or paired-AI environment, D&D is one of the most powerful structured creative writing exercises ever invented, and a uniquely effective tool for mental health context and self-exploration.

### The Gamification of Creative Writing

For a writer, staring at a blank page is the ultimate adversary. The mechanics of D&D—ability scores, dice rolls, and combat abstraction—solve the blank-page syndrome by introducing *procedural constraints*. You aren't just deciding what happens next; you are negotiating with fate.

When the Dungeon Master (or AI) presents a locked iron gate, and you decide to pick the lock, the dice decide the outcome. If you roll a 2, you have failed. The writer is suddenly forced to narratively pivot: *How does my rogue react to failure? Do they kick the door in frustration? To they get caught by a guard?* This friction—the space between "what I want to happen" and "what the mechanics dictate"—is the birthplace of organic, unpredictable, and deeply satisfying creative writing. The mechanics serve as story prompts, forcing the writer to adapt, improvise, and discover the narrative rather than rigidly orchestrating it.

### A Sanctuary for Mental Health

Role-playing inherently requires empathy and perspective-shifting. By creating an avatar, you construct a safe, psychological distancing mechanism. This process—known in therapeutic circles as the "alibi of the game"—allows players to explore complex emotional states, trauma, and identity through the veil of entirely fictional stakes.

A player wrestling with anxiety in the real world might play a heavily armored Paladin, exploring the boundaries of bravery and protection in a world where dragons can be explicitly slain. A player dealing with feelings of powerlessness might weave a narrative of a powerful Wizard altering reality. Defeating a literal monster at the table provides a visceral, symbolic victory over metaphorical monsters. Furthermore, failure in D&D is rarely the end—it is an expected, normalized part of the journey. Normalizing failure and developing resilience in the face of bad luck (a low dice roll) translates beautifully into real-world emotional resilience. 

Solo D&D, powered by an AI DM, offers an incredibly intimate arena for this exact type of creative and psychological exploration. It is a sandbox where you are entirely free to write your legend.

---

### License
This project is licensed under the Apache 2.0 License. See the `LICENSE` file for details.
