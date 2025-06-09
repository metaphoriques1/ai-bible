
import { Theologian, Interpretation, ChristianTradition, CommunityGroup, SpiritualMilestone, ChatMessage, PrayerRequest, JournalEntry } from '../types';

export const SAMPLE_THEOLOGIANS: Theologian[] = [
  { id: 't1', name: 'Gregory of Nyssa', tradition: ChristianTradition.ORTHODOX, era: 'Early Church (c. 335 – c. 395 AD)', bio: 'One of the three Cappadocian Fathers, known for his significant contributions to Trinitarian theology, mystical thought, and Christian Platonism.' },
  { id: 't2', name: 'Thomas Aquinas', tradition: ChristianTradition.CATHOLIC, era: 'Medieval (1225-1274 AD)', bio: 'Immensely influential philosopher, theologian, and jurist.' },
  { id: 't3', name: 'Martin Luther', tradition: ChristianTradition.LUTHERAN, era: 'Reformation (1483-1546 AD)', bio: 'A seminal figure in the Protestant Reformation.' },
  { id: 't4', name: 'John Calvin', tradition: ChristianTradition.PROTESTANT_REFORMED, era: 'Reformation (1509-1564 AD)', bio: 'Influential French theologian and pastor during the Protestant Reformation.' },
  { id: 't5', name: 'John Wesley', tradition: ChristianTradition.PROTESTANT_METHODIST, era: '18th Century (1703-1791 AD)', bio: 'An Anglican cleric and theologian who, with his brother Charles and fellow cleric George Whitefield, founded Methodism.' },
  { id: 't6', name: 'John Chrysostom', tradition: ChristianTradition.ORTHODOX, era: 'Early Church (c. 347-407 AD)', bio: 'Archbishop of Constantinople, known for his preaching and public speaking, revered in Eastern Orthodoxy.'},
  { id: 't7', name: 'N.T. Wright', tradition: ChristianTradition.ANGLICAN, era: 'Contemporary', bio: 'Leading New Testament scholar known for the New Perspective on Paul.'},
];

// Passage format is now "Book Chapter:Verse", e.g., "John 3:16"
export const SAMPLE_INTERPRETATIONS: Interpretation[] = [
  { 
    id: 'i1', passage: 'John 3:16', 
    theologianId: 't1', 
    summary: 'Gregory of Nyssa emphasized God\'s immense love and the Incarnation as a path to theosis (deification) for humanity, where belief in Christ restores the divine image.',
    keywords: ['theosis', 'divine love', 'Incarnation', 'image of God']
  },
  { 
    id: 'i2', passage: 'John 3:16', 
    theologianId: 't3', 
    summary: 'Luther highlighted "faith alone" (sola fide) as the means of receiving this gift of eternal life. God\'s love is universal in offer, but effectual for believers.',
    keywords: ['faith alone', 'universal offer', 'justification']
  },
  { 
    id: 'i3', passage: 'John 3:16', 
    theologianId: 't5', 
    summary: 'Wesley stressed God\'s universal love and prevenient grace enabling all to believe. Salvation is available to everyone who responds in faith.',
    keywords: ['universal love', 'prevenient grace', 'free will']
  },
  { 
    id: 'i4', passage: 'Romans 8:28', 
    theologianId: 't4', 
    summary: 'Calvin saw Romans 8:28 as a promise for the elect, that God orchestrates all things for their ultimate good according to His sovereign plan and purpose.',
    keywords: ['sovereignty', 'providence', 'elect', 'God\'s purpose']
  },
  { 
    id: 'i5', passage: 'Romans 8:28', 
    theologianId: 't1', 
    summary: 'Gregory of Nyssa might interpret this through divine providence, seeing all events, even adversities, as potentially guiding the soul towards God and spiritual perfection (epektasis).',
    keywords: ['providence', 'epektasis', 'spiritual perfection', 'suffering']
  },
  {
    id: 'i6', passage: 'John 1:1', 
    theologianId: 't6',
    summary: 'Chrysostom emphasized the eternal pre-existence and divinity of the Word (Logos), highlighting that the Word was both "with God" (distinct person) and "was God" (same divine essence).',
    keywords: ['Logos', 'divinity of Christ', 'Trinity', 'pre-existence']
  },
  {
    id: 'i7', passage: 'John 1:1', 
    theologianId: 't7',
    summary: 'N.T. Wright often connects John 1:1 with Genesis 1:1, seeing the Word as God\'s agent of creation and new creation, fulfilling Israel\'s story and revealing God\'s wisdom.',
    keywords: ['new creation', 'wisdom', 'Israel\'s story', 'Genesis']
  },
   { 
    id: 'i8', passage: 'Genesis 1:1', 
    theologianId: 't1', 
    summary: 'Gregory of Nyssa affirmed God\'s goodness in creation, often emphasizing the intelligible (noetic) creation as a primary act, with the material world following. He explored the concept of humanity created in God\'s image.',
    keywords: ['creation', 'divine goodness', 'intelligible creation', 'Imago Dei']
  },
  { 
    id: 'i9', passage: 'Genesis 1:26', 
    theologianId: 't4', 
    summary: 'Calvin affirmed God\'s direct creation of humans in His image as described in Genesis 1:26, emphasizing human dignity and purpose. He related this to the concept of Imago Dei.',
    keywords: ['Imago Dei', 'human dignity', 'purposeful design', 'creation']
  },
  // Add more interpretations for individual verses of John 1
  { 
    id: 'i10', passage: 'John 1:2', 
    theologianId: 't1', 
    summary: 'Gregory of Nyssa would strongly affirm John 1:2, underscoring the eternal pre-existence and distinct personhood of the Word (Logos) within the one divine essence, crucial to Cappadocian Trinitarian doctrine.',
    keywords: ['Trinity', 'Logos', 'co-eternity', 'Cappadocian Fathers']
  },
  { 
    id: 'i11', passage: 'John 1:3', 
    theologianId: 't2', 
    summary: 'Aquinas, drawing on Aristotelian philosophy, would interpret John 1:3 as highlighting Christ the Word as the efficient cause of all creation, through whom all things derive their being.',
    keywords: ['creation', 'efficient cause', 'Logos', 'being']
  },
  { 
    id: 'i12', passage: 'John 1:4', 
    theologianId: 't4', 
    summary: 'Calvin would emphasize that in Christ (the Word) is life and this life is the true spiritual light for humanity, a light that sin has obscured but not extinguished.',
    keywords: ['life in Christ', 'spiritual light', 'sin', 'revelation']
  },
  { 
    id: 'i13', passage: 'John 1:5', 
    theologianId: 't5', 
    summary: 'Wesley might focus on John 1:5 in terms of God\'s prevenient grace, the light shining in the darkness, offering illumination to all, even if the darkness (sinful humanity) does not fully comprehend or overcome it without response.',
    keywords: ['prevenient grace', 'light and darkness', 'human response', 'sin']
  }
];

export const SAMPLE_BIBLE_CHAPTER_VERSES: Record<string, string[]> = {
  "Genesis 1": [
    "1 In the beginning God created the heavens and the earth.",
    "2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.",
    "3 And God said, \"Let there be light,\" and there was light.",
    "4 God saw that the light was good, and he separated the light from the darkness.",
    "5 God called the light \"day,\" and the darkness he called \"night.\" And there was evening, and there was morning—the first day.",
    // ... (Genesis 1 continues, add more verses as needed for testing)
    "26 Then God said, \"Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground.\"",
    "27 So God created mankind in his own image, in the image of God he created them; male and female he created them.",
    "31 God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day."
  ],
  "John 1": [
    "1 In the beginning was the Word, and the Word was with God, and the Word was God.",
    "2 He was with God in the beginning.",
    "3 Through him all things were made; without him nothing was made that has been made.",
    "4 In him was life, and that life was the light of all mankind.",
    "5 The light shines in the darkness, and the darkness has not overcome it.",
    "6 There was a man sent from God whose name was John.",
    "7 He came as a witness to testify concerning that light, so that through him all might believe.",
    "8 He himself was not the light; he came only as a witness to the light.",
    "9 The true light that gives light to everyone was coming into the world.",
    "10 He was in the world, and though the world was made through him, the world did not recognize him.",
    "11 He came to that which was his own, but his own did not receive him.",
    "12 Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God—",
    "13 children born not of natural descent, nor of human decision or a husband’s will, but born of God.",
    "14 The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.",
    // ... (John 1 continues, for brevity, only first 14 verses are fully written out)
    "15 John testified concerning him. He cried out, saying, \"This is the one I spoke about when I said, 'He who comes after me has surpassed me because he was before me.'\"",
    "16 Out of his fullness we have all received grace in place of grace already given.",
    "17 For the law was given through Moses; grace and truth came through Jesus Christ.",
    "18 No one has ever seen God, but the one and only Son, who is himself God and is in closest relationship with the Father, has made him known."
    // ... up to verse 51
  ],
  "John 3": [
    "1 Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
    "2 He came to Jesus at night and said, “Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him.”",
    // ... (John 3 continues)
    "16 For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
  ],
  "Romans 8": [
    "1 Therefore, there is now no condemnation for those who are in Christ Jesus,",
    "2 because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.",
    // ... (Romans 8 continues)
    "28 And we know that in all things God works for the good of those who love him, who have been called according to his purpose."
  ],
  "Psalms 23": [
    "1 The LORD is my shepherd, I lack nothing.",
    "2 He makes me lie down in green pastures, he leads me beside quiet waters,",
    "3 he refreshes my soul. He guides me along the right paths for his name’s sake.",
    "4 Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
    "5 You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.",
    "6 Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever."
  ]
};


export const SAMPLE_COMMUNITY_GROUPS: CommunityGroup[] = [
  { id: 'cg1', name: 'Men\'s Early Morning Bible Study', description: 'Discussing the Gospels and practical application.', membersCount: 12, focusArea: 'Bible Study', isPrivate: false },
  { id: 'cg2', name: 'New Moms Support Group', description: 'Sharing encouragement and wisdom for new mothers.', membersCount: 8, focusArea: 'Support', isPrivate: true },
  { id: 'cg3', name: 'Theology Deep Dive', description: 'Exploring systematic theology topics.', membersCount: 25, focusArea: 'Theology', isPrivate: false },
];

export const SAMPLE_MILESTONES: SpiritualMilestone[] = [
  { id: 'm1', title: 'Read 5 Bible Chapters', description: 'Completed reading 5 chapters of the Bible.', achievedDate: new Date(Date.now() - 86400000 * 5), progress: 100 },
  { id: 'm2', title: 'First Journal Entry', description: 'Shared your first reflection.', achievedDate: new Date(Date.now() - 86400000 * 3), progress: 100 },
  { id: 'm3', title: 'Consistent Quiet Time', description: '7 days of prayer or study.', progress: 60 },
  { id: 'm4', title: 'Explore a New Tradition', description: 'Learned about a different Christian perspective.', progress: 20 },
];

export const SAMPLE_PRAYER_REQUESTS: PrayerRequest[] = [
  { id: 'pr1', text: 'Praying for wisdom in a difficult work situation.', timestamp: new Date(Date.now() - 86400000 * 2), isAnswered: false, sharedWithCommunity: true },
  { id: 'pr2', text: 'For my family\'s health and safety.', timestamp: new Date(Date.now() - 86400000), isAnswered: false },
];

export const SAMPLE_JOURNAL_ENTRIES: JournalEntry[] = [
  { 
    id: 'je1', 
    title: 'Reflections on Grace', 
    text: 'Today I was thinking about God\'s amazing grace and how it impacts my daily life. It\'s overwhelming sometimes.', 
    timestamp: new Date(Date.now() - 86400000 * 1.5), 
    mood: 'Hopeful', 
    themes: ['grace', 'gratitude'],
    tags: ['Gratitude', 'Grace'] 
  },
  { 
    id: 'je2', 
    title: 'Struggles with Patience', 
    text: 'Finding it hard to be patient with my kids lately. Need to remember the fruit of the Spirit.', 
    timestamp: new Date(), 
    mood: 'Challenged', 
    themes: ['patience', 'parenting', 'fruit of the Spirit'],
    tags: ['Challenge', 'Growth']
  },
  {
    id: 'je3',
    title: 'Peace in the Storm',
    text: 'Felt a real sense of peace today despite a lot of chaos around me. Reading Psalm 46 helped.',
    timestamp: new Date(Date.now() - 86400000 * 0.5),
    mood: 'Peaceful',
    themes: ['peace', 'scripture', 'trust'],
    tags: ['Peace', 'Scripture Reflection']
  }
];


export const getCoachResponseSample = (userInput: string, userName?: string): ChatMessage => {
  const lowerInput = userInput.toLowerCase();
  let responseText = `That's an interesting point${userName ? `, ${userName}` : ''}.`;
  let suggestions: string[] = ["Tell me more.", "What Bible passage comes to mind?", "How does this relate to your week?"];

  if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    responseText = `Hello${userName ? ` ${userName}` : ''}! How can I assist you in your spiritual journey today?`;
    suggestions = ["I'd like a Bible passage recommendation.", "Can we discuss a topic?", "I have a question about faith."];
  } else if (lowerInput.includes("stress") || lowerInput.includes("anxious")) {
    responseText = "I understand that stress and anxiety can be challenging. Philippians 4:6-7 reminds us, 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' Would you like to explore this passage further?";
    suggestions = ["Yes, let's explore Philippians 4:6-7.", "What are other passages about peace?", "How can I apply this?"];
  } else if (lowerInput.includes("joy") || lowerInput.includes("happy")) {
    responseText = "It's wonderful to hear you're experiencing joy! Nehemiah 8:10 says, 'The joy of the Lord is your strength.' How are you seeing God's joy in your life right now?";
    suggestions = ["What does 'joy of the Lord' mean?", "Share more about Nehemiah 8:10.", "How can I cultivate more joy?"];
  } else if (lowerInput.includes("doubt") || lowerInput.includes("question")) {
    responseText = "It's perfectly normal to have questions and doubts on our faith journey. Jude 1:22 encourages us to 'be merciful to those who doubt.' What specific questions are on your mind?";
    suggestions = ["Is it okay to doubt?", "Where can I find answers?", "Recommend resources for doubters."];
  } else if (lowerInput.includes("interpret") && (lowerInput.includes("john 3:16") || lowerInput.includes("romans 8:28"))) { 
     const passage = lowerInput.includes("john 3:16") ? "John 3:16" : "Romans 8:28";
     responseText = `Ah, ${passage} is a very significant passage! Many theologians have offered insights. For example, concerning ${passage}, we could look at what Gregory of Nyssa or Luther thought. Would you like to explore perspectives on this passage in the 'Interpretations' section?`;
     suggestions = [`Tell me about Gregory of Nyssa on ${passage}`, `What did Luther say about ${passage}?`, "Take me to Interpretations."];
  } else {
     responseText = `Thank you for sharing that${userName ? `, ${userName}` : ''}. How can I help you reflect on this biblically? Perhaps we can find a relevant scripture or discuss a theological concept?`;
  }

  return {
    id: `ai-${Date.now()}`,
    sender: 'ai',
    text: responseText,
    timestamp: new Date(),
    suggestions: suggestions,
  };
};
