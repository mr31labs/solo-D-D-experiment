// --- STORAGE ---
const Storage = {
    saveData(key, value) {
        localStorage.setItem(`soloDnd_${key}`, JSON.stringify(value));
    },
    loadData(key) {
        const data = localStorage.getItem(`soloDnd_${key}`);
        return data ? JSON.parse(data) : null;
    },
    hasApiKey() { return !!this.loadData('apiKey'); },
    getApiKey() { return this.loadData('apiKey'); },
    getModel() { return this.loadData('model') || 'gemini-2.5-flash'; },
    saveCharacter(charData) { this.saveData('character', charData); },
    loadCharacter() { return this.loadData('character'); }
};

// --- CHARACTER SYSTEM ---
const CharacterSystem = {
    parseDndBeyondJson(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const character = data.data || data.character || data; 
            
            const stats = {
                str: this.calculateStatTotal(character, 1),
                dex: this.calculateStatTotal(character, 2),
                con: this.calculateStatTotal(character, 3),
                int: this.calculateStatTotal(character, 4),
                wis: this.calculateStatTotal(character, 5),
                cha: this.calculateStatTotal(character, 6)
            };
            
            return {
                name: character.name,
                avatarUrl: character.avatarUrl || null,
                level: character.classes.reduce((acc, cls) => acc + cls.level, 0),
                race: character.race.fullName,
                classes: character.classes.map(c => c.definition.name).join('/'),
                stats,
                modifiers: {
                    str: this.getModifier(stats.str),
                    dex: this.getModifier(stats.dex),
                    con: this.getModifier(stats.con),
                    int: this.getModifier(stats.int),
                    wis: this.getModifier(stats.wis),
                    cha: this.getModifier(stats.cha),
                },
                hpMax: character.baseHitPoints + (this.getModifier(stats.con) * character.classes.reduce((acc, cls) => acc + cls.level, 0)),
                hpCurrent: character.baseHitPoints, 
                ac: 10 + this.getModifier(stats.dex) 
            };
        } catch (e) {
            console.error("Error parsing D&D Beyond JSON", e);
            throw new Error("Invalid character JSON format.");
        }
    },
    
    calculateStatTotal(character, statId) {
        const baseStat = character.stats.find(s => s.id === statId)?.value || 10;
        let bonus = 0;
        if (character.bonusStats && character.bonusStats.length > 0) {
           const bonusObj = character.bonusStats.find(s => s.id === statId);
           if (bonusObj && bonusObj.value) bonus += bonusObj.value;
        }
        return baseStat + bonus;
    },
    
    getModifier(score) {
        return Math.floor((score - 10) / 2);
    },
    
    updateUI(charData) {
        document.getElementById('char-name').textContent = charData.name;
        document.getElementById('char-race-class').textContent = `${charData.race} ${charData.classes} - Level ${charData.level}`;
        
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
            const mod = charData.modifiers[stat];
            const modString = mod >= 0 ? `+${mod}` : mod;
            document.getElementById(`stat-${stat}`).innerHTML = `${charData.stats[stat]}<span class="stat-mod">${modString}</span>`;
        });
        
        document.getElementById('char-ac').textContent = charData.ac;
        document.getElementById('char-hp-max').textContent = charData.hpMax;
        document.getElementById('char-hp-current').textContent = charData.hpMax;
        
        if (charData.avatarUrl) {
            const portrait = document.querySelector('.char-portrait-placeholder');
            portrait.style.backgroundImage = `url('${charData.avatarUrl}')`;
            portrait.style.backgroundSize = 'cover';
            portrait.style.backgroundPosition = 'center top';
            portrait.innerHTML = '';
        } else {
            const portrait = document.querySelector('.char-portrait-placeholder');
            portrait.style.backgroundImage = 'none';
            portrait.innerHTML = '<svg viewBox="0 0 100 100" fill="var(--gold-accent)" opacity="0.6"><path d="M50 10 C35 10 25 25 25 40 C25 55 35 60 50 60 C65 60 75 55 75 40 C75 25 65 10 50 10 Z"/><path d="M20 90 C20 75 30 65 50 65 C70 65 80 75 80 90 L20 90 Z"/></svg>';
        }
        
        document.getElementById('character-import-area').classList.add('hidden');
        document.getElementById('character-sheet').classList.remove('hidden');
    }
};

// --- DICE ---
const Dice = {
    isRolling: false,
    
    getSVGShape(sides) {
        const svgs = {
            4: '<polygon points="50,10 90,85 10,85" class="die-face"/><polygon points="50,10 50,60 10,85" class="die-face-shade1"/><polygon points="50,10 90,85 50,60" class="die-face-highlight"/>',
            6: '<rect x="15" y="15" width="70" height="70" rx="10" class="die-face"/>',
            8: '<polygon points="50,5 95,50 50,95 5,50" class="die-face"/><polygon points="50,5 50,50 5,50" class="die-face-shade1"/><polygon points="50,5 95,50 50,50" class="die-face-highlight"/><polygon points="5,50 50,50 50,95" class="die-face-shade1"/>',
            10: '<polygon points="50,5 90,40 50,95 10,40" class="die-face"/><polygon points="50,5 50,45 10,40" class="die-face-shade1"/><polygon points="50,5 90,40 50,45" class="die-face-highlight"/><polygon points="10,40 50,45 50,95" class="die-face-shade2"/><polygon points="90,40 50,95 50,45" class="die-face-shade1"/>',
            12: '<polygon points="50,5 95,35 80,90 20,90 5,35" class="die-face"/><polygon points="50,5 75,45 25,45" class="die-face-highlight"/><polygon points="5,35 25,45 50,90" class="die-face-shade1"/><polygon points="95,35 75,45 50,90" class="die-face-shade2"/>',
            20: '<polygon points="50,5 95,25 95,75 50,95 5,75 5,25" class="die-face"/><polygon points="50,5 75,45 25,45" class="die-face-highlight"/><polygon points="25,45 50,85 75,45" class="die-face-shade1"/><polygon points="5,25 25,45 5,75" class="die-face-shade2"/><polygon points="95,25 95,75 75,45" class="die-face-shade1"/><polygon points="5,75 50,95 50,85" class="die-face-shade2"/><polygon points="95,75 50,95 50,85" class="die-face-shade1"/>'
        };
        return svgs[sides] || svgs[20];
    },

    roll(sides, modifier = 0) {
        if (this.isRolling) return;
        this.isRolling = true;
        
        const overlay = document.getElementById('svg-dice-overlay');
        overlay.classList.remove('hidden');
        
        const result = Math.floor(Math.random() * sides) + 1;
        const total = result + modifier;
        
        overlay.innerHTML = `
            <div class="die-wrapper">
                <svg viewBox="0 0 100 100" class="die-svg">
                    ${this.getSVGShape(sides)}
                </svg>
                <div class="die-result">${result}</div>
            </div>
        `;
        
        setTimeout(() => {
            const inputEl = document.getElementById('player-action-input');
            const actionText = `I rolled a ${total} on my d${sides} check.`;
            inputEl.value = inputEl.value ? inputEl.value + '\n' + actionText : actionText;
            
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.innerHTML = '';
                this.isRolling = false;
            }, 1000);
        }, 1500);
    },
    
    bindEvents() {
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sides = parseInt(e.target.dataset.sides);
                this.roll(sides, 0); 
            });
        });
    }
};

// --- AI ENGINE ---
class AIEngine {
    constructor() {
        this.systemInstruction = `
You are an expert Dungeon Master running a Solo D&D 2024 campaign for one player.
You must narrate the adventure, control NPCs/monsters, and ask the player for their actions.

FORMAT REQUIREMENT:
Your response should ONLY be the narrative text describing what happens and dialogue. Do NOT output JSON blocks for maps.
Whenever a skill check, saving throw, or attack roll is necessary based on the rules, stop your narration at that exact point and DIRECTLY INSTRUCT the player to roll the exact dice needed (e.g. "Roll a d20 for your Stealth check"). 
Do NOT assume the outcome of the roll until the player provides their result in their next message.

Keep narratives highly descriptive, engaging, but concise. Always end by prompting the player for their action or roll result.
`;
    }
    
    async initialize(scenario, customText = null) {
        const apiKey = Storage.getApiKey();
        if (!apiKey) throw new Error("API Key missing");
        
        this.apiKey = apiKey;
        
        let startPrompt = `The player has chosen the scenario: ${scenario}. Begin the adventure, describe the starting location vividly, and ask what they do.`;
        
        if (customText) {
            this.systemInstruction += `\n\n--- CUSTOM ADVENTURE MODULE BEGIN ---\n${customText}\n--- CUSTOM ADVENTURE MODULE END ---\n\nCRITICAL DIRECTIVE: You must run the exact story, characters, and encounters defined in the custom module above. Start the narrative exactly as the module begins.`;
            startPrompt = `The player has provided a custom adventure module (see system instructions). Begin the adventure based precisely on the provided module text, describe the starting location vividly, and ask the player what they do.`;
        }
        
        return this.sendMessage(startPrompt);
    }
    
    async sendMessage(message) {
        try {
            const modelName = Storage.getModel();
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: this.systemInstruction }]
                    },
                    contents: [
                        { role: 'user', parts: [{ text: message }] }
                    ]
                })
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            const narrative = data.candidates[0].content.parts[0].text;
            return { narrative };
        } catch (error) {
            console.error("AI Engine Error:", error);
            throw error;
        }
    }
}

// --- MAIN APP ---
let aiEngine;
let characterData = null;

function init() {
    console.log("App Initialized.");
    
    const cachedChar = Storage.loadCharacter();
    if (cachedChar) {
        characterData = cachedChar;
        CharacterSystem.updateUI(characterData);
    }
    
    if (!Storage.hasApiKey()) {
        document.getElementById('api-key-modal').classList.add('active');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('model-dropdown').value = Storage.getModel();
    } else {
        document.getElementById('api-key-modal').classList.remove('active');
        startGameShell();
    }
    
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('api-key-input').value = Storage.getApiKey() || '';
        document.getElementById('model-dropdown').value = Storage.getModel();
        document.getElementById('api-key-modal').classList.add('active');
    });
    
    document.getElementById('save-key-btn').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        const model = document.getElementById('model-dropdown').value;
        if (key) {
            Storage.saveData('apiKey', key);
            Storage.saveData('model', model);
            document.getElementById('api-key-modal').classList.remove('active');
            startGameShell();
        } else {
            alert("Please enter an API Key.");
        }
    });
    
    document.getElementById('import-btn').addEventListener('click', () => {
        const jsonInput = document.getElementById('json-import-input').value.trim();
        if (!jsonInput) return;
        
        try {
            characterData = CharacterSystem.parseDndBeyondJson(jsonInput);
            CharacterSystem.updateUI(characterData);
            Storage.saveCharacter(characterData);
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
        }
    });

    document.getElementById('scenario-dropdown').addEventListener('change', (e) => {
        const fileInput = document.getElementById('custom-adventure-file');
        if (e.target.value === 'custom') {
            fileInput.classList.remove('hidden');
        } else {
            fileInput.classList.add('hidden');
        }
    });

    document.getElementById('start-scenario-btn').addEventListener('click', async () => {
        const scenario = document.getElementById('scenario-dropdown').value;
        if (!scenario) return;
        
        if (!characterData) {
            alert("Please import your character first before starting the scenario!");
            return;
        }

        let customText = null;
        if (scenario === 'custom') {
            const fileInput = document.getElementById('custom-adventure-file');
            if (!fileInput.files.length) {
                alert("Please select a .md or .txt custom adventure file!");
                return;
            }
            
            try {
                customText = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = e => reject(e);
                    reader.readAsText(fileInput.files[0]);
                });
            } catch (err) {
                alert("Failed to read the custom adventure file.");
                return;
            }
        }

        document.getElementById('scenario-selector').classList.add('hidden');
        document.getElementById('action-input-group').classList.remove('hidden');
        
        appendMessage("System", `Starting scenario...`, 'system-message');
        
        aiEngine = new AIEngine();
        try {
            const response = await aiEngine.initialize(scenario, customText);
            handleAIResponse(response);
        } catch (e) {
            appendMessage("Error", "Failed to contact Gemini API. Check your key.", 'system-message');
            console.error(e);
        }
    });
    
    document.getElementById('send-action-btn').addEventListener('click', async () => {
        const inputEl = document.getElementById('player-action-input');
        const action = inputEl.value.trim();
        if (!action) return;
        
        inputEl.value = '';
        appendMessage("You", action, 'msg-player');
        
        try {
            const response = await aiEngine.sendMessage(action);
            handleAIResponse(response);
        } catch (e) {
            appendMessage("Error", "AI request failed.", 'system-message');
        }
    });
    
    Dice.bindEvents();
}

function startGameShell() {
    document.getElementById('app-container').classList.remove('hidden');
}

function handleAIResponse(response) {
    appendMessage("Dungeon Master", response.narrative, 'msg-dm');
}

function appendMessage(sender, text, className) {
    const log = document.getElementById('narrative-log');
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    
    const htmlText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
        
    msgDiv.innerHTML = `<strong>${sender}</strong><br/>${htmlText}`;
    log.appendChild(msgDiv);
    
    log.scrollTop = log.scrollHeight;
}

window.addEventListener('DOMContentLoaded', init);
