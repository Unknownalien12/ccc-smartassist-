import { KnowledgeItem } from "../types";

export const findFallbackAnswer = (query: string, knowledgeBase: KnowledgeItem[]): string => {
  const lowerQuery = query.toLowerCase();

  // Simple keyword matching scoring
  let bestMatch: KnowledgeItem | null = null;
  let maxScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    const lowerQuestion = item.question.toLowerCase();
    const lowerAnswer = item.answer.toLowerCase();

    // Tokenize query
    const tokens = lowerQuery.split(" ").filter(t => t.length > 3);

    for (const token of tokens) {
      if (lowerQuestion.includes(token)) score += 3;
      if (lowerAnswer.includes(token)) score += 1;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return `(Offline Mode) Based on my records:\n\n${bestMatch.answer}`;
  }

  // Check specifically for enrollment intent if no specific match found
  if (lowerQuery.includes('enroll') || lowerQuery.includes('admission')) {
     return `(Offline Mode) To assist you with enrollment, are you a New Student, Old Student, Transferee, or Returning Student? Please specify so I can check my records.`;
  }

  return `(Offline Mode) I apologize, but I cannot connect to the server right now. For accurate information, please contact the Registrar's Office directly or visit the school administration.`;
};
