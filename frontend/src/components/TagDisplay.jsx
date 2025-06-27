// TagDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Helper function to normalize tags (remove duplicates, empty strings, etc.)
 * @param {Array} tags Raw array of tags
 * @returns {Array} Normalized array of tags
 */
const normalizeTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return [];

    // Remove duplicates, empty strings, and trim whitespace
    const normalizedTags = [...new Set(
        tags
            .map(tag => typeof tag === 'string' ? tag.trim() : '')
            .filter(tag => tag.length > 0)
    )];

    return normalizedTags;
};

/**
 * Reusable component for displaying property tags
 * 
 * @param {Object} props Component props
 * @param {Array} props.tags Array of tag strings to display
 * @param {Number} props.limit Maximum number of tags to display (default: show all)
 * @param {String} props.size Size of tags ('sm', 'md', 'lg')
 * @param {String} props.type Visual style of tags ('default', 'primary', 'outline', 'feature')
 * @param {Boolean} props.clickable Whether tags can be clicked (emits onClick event)
 * @param {Function} props.onTagClick Callback when a tag is clicked (receives tag as parameter)
 * @param {Array} props.selectedTags Array of currently selected tags (for clickable tags)
 */
const TagDisplay = ({
    tags,
    limit,
    size = 'md',
    type = 'default',
    clickable = false,
    onTagClick,
    selectedTags = []
}) => {
    // Normalize tags before processing
    const normalizedTags = normalizeTags(tags);
    const normalizedSelectedTags = normalizeTags(selectedTags);

    // Return early if no tags after normalization
    if (normalizedTags.length === 0) return null;

    // Limit the number of visible tags if specified
    const visibleTags = limit ? normalizedTags.slice(0, limit) : normalizedTags;
    const hiddenCount = limit && normalizedTags.length > limit ? normalizedTags.length - limit : 0;

    // Define styles based on size and type
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'text-xs px-2 py-0.5';
            case 'lg': return 'text-sm px-4 py-1.5';
            default: return 'text-sm px-3 py-1'; // medium (default)
        }
    };

    const getTypeClasses = (tag) => {
        const isSelected = selectedTags.includes(tag);

        switch (type) {
            case 'primary':
                return isSelected
                    ? 'bg-green-600 text-white border border-green-600'
                    : 'bg-green-100 text-green-800 border border-green-200';
            case 'outline':
                return isSelected
                    ? 'bg-blue-50 text-blue-700 border border-blue-500'
                    : 'bg-white text-blue-700 border border-blue-200';
            case 'feature':
                return isSelected
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : 'bg-orange-50 text-orange-700 border border-orange-200';
            default:
                return isSelected
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag, idx) => (
                <span
                    key={idx}
                    className={`rounded-full transition-colors ${getSizeClasses()} ${getTypeClasses(tag)} ${clickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={clickable && onTagClick ? () => onTagClick(tag) : undefined}
                >
                    {tag}
                </span>
            ))}
            {hiddenCount > 0 && (
                <span className={`rounded-full bg-gray-100 text-gray-600 border border-gray-200 ${getSizeClasses()}`}>
                    +{hiddenCount} more
                </span>
            )}
        </div>
    );
};

TagDisplay.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    limit: PropTypes.number,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    type: PropTypes.oneOf(['default', 'primary', 'outline', 'feature']),
    clickable: PropTypes.bool,
    onTagClick: PropTypes.func,
    selectedTags: PropTypes.arrayOf(PropTypes.string)
};

export default TagDisplay;
