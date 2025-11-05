export const CHAT_MODES = [
  { id: 'pirate', name: 'Pirate Mode', emoji: '🏴‍☠️', description: 'Ahoy matey! ⚓🏴‍☠️' },
  { id: 'shakespeare', name: 'Shakespeare Mode', emoji: '🎭', description: 'Verily, thy words... 📜✨' },
  { id: 'robot', name: 'Robot Mode', emoji: '🤖', description: 'BEEP.BOOP.PROCESSING... 🔧⚙️' },
  { id: 'horror', name: 'Horror Mode', emoji: '👻', description: 'Your words... whispered in shadows... 👻🕷️' },
  { id: 'party', name: 'Party Mode', emoji: '🎉', description: 'YAAAS! Everything! Is! EXCITING! 🥳💃' },
  { id: 'fantasy', name: 'Fantasy Mode', emoji: '🧙‍♂️', description: 'By ancient magic... ✨🐉' },
  { id: 'alien', name: 'Alien Mode', emoji: '👽', description: 'Greetings earthling... 🛸👾' },
  { id: 'detective', name: 'Detective Mode', emoji: '🕵️', description: 'The evidence suggests... 🔍📝' },
  { id: 'corporate', name: 'Corporate Mode', emoji: '💼', description: 'Circling back to synergize... 📊💻' },
  { id: 'genz', name: 'Gen Z Mode', emoji: '💅', description: 'No cap, this is bussin fr fr! 💅✨' }
];

export const getChatModeById = (id) => {
  return CHAT_MODES.find(mode => mode.id === id) || CHAT_MODES[0];
};
