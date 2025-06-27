import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display popular tag chips for quick filtering
 * 
 * @param {Object} props Component props
 * @param {Array} props.tags Array of tag objects with name and count
 * @param {Function} props.onTagClick Callback when a tag is clicked
 * @param {Array} props.selectedTags Array of currently selected tags
 */
const PopularTags = ({ tags = [], onTagClick, selectedTags = [] }) => {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Popular Features</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                        <button
                            key={tag.name}
                            onClick={() => onTagClick(tag.name)}
                            className={`
                flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all
                ${isSelected
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
              `}
                        >
                            {tag.name}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {tag.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

PopularTags.propTypes = {
    tags: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired
        })
    ).isRequired,
    onTagClick: PropTypes.func.isRequired,
    selectedTags: PropTypes.arrayOf(PropTypes.string)
};

export default PopularTags;
