export const slugify = (str) => str.toLowerCase().replace(/\s+/g,'-');
export const formatDate = (date) => new Date(date).toLocaleDateString();
