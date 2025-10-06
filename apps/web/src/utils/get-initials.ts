const WHITESPACE_REGEX = /\s+/;
const ALPHANUMERIC_REGEX = /[a-zA-Z0-9]/;

export function getInitials(name: string): string {
  if (!name.trim()) {
    return "";
  }

  const words = name.trim().split(WHITESPACE_REGEX);

  const getFirstAlphanumeric = (word: string): string => {
    for (const char of word) {
      if (ALPHANUMERIC_REGEX.test(char)) {
        return char;
      }
    }
    return "";
  };

  if (words.length === 1) {
    const firstWord = words[0];
    if (firstWord) {
      const alphanumericChars = firstWord
        .split("")
        .filter((char) => ALPHANUMERIC_REGEX.test(char));
      if (
        alphanumericChars.length >= 2 &&
        alphanumericChars[0] &&
        alphanumericChars[1]
      ) {
        return (alphanumericChars[0] + alphanumericChars[1]).toUpperCase();
      }
      if (alphanumericChars.length === 1 && alphanumericChars[0]) {
        return alphanumericChars[0].toUpperCase();
      }
    }
    return "";
  }

  if (words.length >= 2) {
    const firstChar = getFirstAlphanumeric(words[0] || "");
    const secondChar = getFirstAlphanumeric(words[1] || "");
    return (firstChar + secondChar).toUpperCase();
  }

  return "";
}
