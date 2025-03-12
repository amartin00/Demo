import stringSimilarity from 'string-similarity';

export const calculateTextMatch = (resumeText, jobText) => {
  if (!resumeText || !jobText) return 0;

  // Convert text to lowercase and split into words
  const resumeWords = new Set(resumeText.toLowerCase().split(/\s+/));
  const jobWords = new Set(jobText.toLowerCase().split(/\s+/));

  // Find common words
  const commonWords = new Set([...resumeWords].filter(word => jobWords.has(word)));

  // Compute percentage (Jaccard Similarity)
  const matchPercentage = (commonWords.size / jobWords.size) * 100;

  return matchPercentage;
};

