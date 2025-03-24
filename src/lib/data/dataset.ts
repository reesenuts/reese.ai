export interface DataEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  variations: string[];
}

export const dataset: DataEntry[] = [
  {
    id: "1",
    question: "What's my name?",
    answer:
      "Your name is Lee Parker Parantar. You are a passionate UI/UX Designer, Frontend Developer, and also the sweetest girl that tends to get misunderstood a lot of times.",
    category: "personal",
    keywords: ["name", "my", "who", "am", "i"],
    variations: [`who am i`, `what do you call me`, `my name`],
  },

  {
    id: "2",
    question: "What are my hobbies?",
    answer: "UI/UX Design, Crocheting, Dancing, and Surfing the Internet",
    category: "hobbies",
    keywords: ["hobbies", "interests", "passions", "activities"],
    variations: [`I like to do`, `I'm interested in`, `I'm' passionate about`],
  },

  {
    id: "3",
    question: "What are my favorite foods?",
    answer:
      "You prefer salty, umami, and basic foods and dislike sugarry, sweet foods, and vegetables.",
    category: "food",
    keywords: ["foods", "to eat"],
    variations: [`Favorite food`, `Things to eat`, `Food I like`],
  },
];

function calculateStringSimilarity(str1: string, str2: string): number {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  if (str1 === str2) return 1;

  if (str1.includes(str2) || str2.includes(str1)) return 0.8;

  const words1 = new Set(str1.split(/\s+/));
  const words2 = str2.split(/\s+/);
  const commonWords = words2.filter((word) => words1.has(word));

  return commonWords.length / Math.max(words1.size, words2.length);
}

function findMatchingKeywords(query: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  query = query.toLowerCase();
  const queryWords = new Set(query.split(/\s+/));

  let matches = 0;
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    for (const word of queryWords) {
      if (word.includes(keywordLower) || keywordLower.includes(word)) {
        matches++;
        break;
      }
    }
  }

  return matches;
}

const queryCache = new Map<string, DataEntry[]>();
const CACHE_SIZE = 20;

export function findRelevantEntries(query: string): DataEntry[] {
  query = query.toLowerCase().trim();

  if (queryCache.has(query)) {
    return queryCache.get(query)!;
  }

  if (!query) return [];

  const scoredEntries = dataset.map((entry) => {
    let score = 0;

    for (const variation of entry.variations) {
      const similarity = calculateStringSimilarity(query, variation);
      if (similarity > 0.7) {
        score += 3;
        break;
      }
    }

    const keywordMatches = findMatchingKeywords(query, entry.keywords);
    score += keywordMatches;

    if (query.includes(entry.category.toLowerCase())) score += 1;

    const questionSimilarity = calculateStringSimilarity(query, entry.question);
    score += questionSimilarity * 2;

    return { entry, score };
  });

  const relevantEntries = scoredEntries
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);

  const result = relevantEntries.slice(0, 3);

  queryCache.set(query, result);

  if (queryCache.size > CACHE_SIZE) {
    const firstKey: any = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }

  return result;
}

export function formatContext(entries: DataEntry[]): string {
  if (entries.length === 0) return "";

  let context = "Here is some relevant information:\n\n";
  entries.forEach((entry) => {
    context += `Q: ${entry.question}\nA: ${entry.answer}\n\n`;
  });
  return context;
}
