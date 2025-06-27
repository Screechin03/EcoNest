/**
 * Utility functions for dealing with property tags
 */

/**
 * Cleans and validates tags, returning an array of valid tags
 * @param {string|Array} tags - Tags as string or array
 * @returns {Array} Array of validated tags
 */
export const validateTags = (tags) => {
    if (!tags) return [];

    // If already an array
    if (Array.isArray(tags)) {
        return tags
            .map(tag => tag?.trim())
            .filter(tag => tag && tag.length > 0);
    }

    // If comma-separated string
    return tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && tag.length > 0);
};

/**
 * Convert an array of tags to a comma-separated string
 * @param {Array} tagsArray - Array of tag strings
 * @returns {string} Comma-separated string of tags
 */
export const tagsArrayToString = (tagsArray) => {
    if (!tagsArray || !Array.isArray(tagsArray)) return '';
    return tagsArray
        .map(tag => tag.trim())
        .filter(tag => tag && tag.length > 0)
        .join(', ');
};

/**
 * Calculate most common tags from a list of properties
 * @param {Array} properties - Array of property objects
 * @param {number} limit - Maximum number of tags to return
 * @returns {Array} Array of tag objects with name and count
 */
export const calculatePopularTags = (properties, limit = 10) => {
    if (!properties || !Array.isArray(properties)) return [];

    const tagFrequencyMap = {};

    properties.forEach(property => {
        const propertyTags = (property.tags || [])
            .filter(tag => tag && tag.trim().length > 0);

        propertyTags.forEach(tag => {
            tagFrequencyMap[tag] = (tagFrequencyMap[tag] || 0) + 1;
        });
    });

    return Object.entries(tagFrequencyMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

export default {
    validateTags,
    tagsArrayToString,
    calculatePopularTags
};
