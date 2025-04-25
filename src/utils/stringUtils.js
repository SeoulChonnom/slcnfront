export const isNullToBlank = (text) => {
  if (text == null || text == undefined || isNaN(text)) {
    return '';
  } else {
    return text;
  }
};
