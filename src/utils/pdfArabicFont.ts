// Helper function to detect Arabic characters
export const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

// Helper to reverse Arabic text for proper display
export const reverseArabicText = (text: string): string => {
  if (!containsArabic(text)) {
    return text;
  }
  
  // Split by newlines and reverse each line
  return text.split('\n').map(line => {
    if (containsArabic(line)) {
      return line.split('').reverse().join('');
    }
    return line;
  }).join('\n');
};