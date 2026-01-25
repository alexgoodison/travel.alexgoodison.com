/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns The minimum number of single-character edits needed to transform str1 into str2
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  // Initialize DP table
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Check if answer is close enough using fuzzy matching
 * @param userAnswer The user's answer
 * @param correctAnswer The correct answer
 * @param maxDistance Maximum allowed Levenshtein distance (default: 2)
 * @returns true if the answers match within the allowed distance
 */
export function isFuzzyMatch(
  userAnswer: string,
  correctAnswer: string,
  maxDistance: number = 2
): boolean {
  // First try exact match (case-insensitive)
  if (userAnswer === correctAnswer) return true;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(userAnswer, correctAnswer);

  // Allow matches within maxDistance
  return distance <= maxDistance;
}
