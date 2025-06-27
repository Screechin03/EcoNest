import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFilter, FaSearch } from 'react-icons/fa';
import TagDisplay from './TagDisplay';

/**
 * Component for filtering properties by tags
 * 
 * @param {Object} props Component props
 * @param {Array} props.availableTags Array of all available tags
 * @param {Array} props.selectedTags Array of currently selected tags
 * @param {Function} props.onTagsChange Callback when tags selection changes
 * @param {Boolean} props.compact Whether to show in compact mode
 */
const TagFilter = ({
    availableTags = [],
    selectedTags = [],
    onTagsChange,
    compact = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAll, setShowAll] = useState(false);

    // Filter tags based on search term
    const filteredTags = searchTerm.length > 0
        ? availableTags.filter(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : availableTags;

    // Display limited tags or all based on showAll flag
    const displayTags = showAll ? filteredTags : filteredTags.slice(0, compact ? 8 : 15);

    // Handle tag selection/deselection
    const toggleTag = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        onTagsChange(newSelectedTags);
    };

    if (availableTags.length === 0) return null;

    return (
        <div className={`${compact ? 'p-3' : 'p-4'} bg-white border border-gray-200 rounded-lg shadow-sm`}>
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FaFilter className="text-green-600" />
                Filter by Features
            </h3>

            {/* Search input */}
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Selected Features:</p>
                    <TagDisplay
                        tags={selectedTags}
                        type="primary"
                        size="sm"
                        clickable={true}
                        onTagClick={toggleTag}
                        selectedTags={selectedTags}
                    />
                </div>
            )}

            {/* Available tags */}
            <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Available Features:</p>
                <TagDisplay
                    tags={displayTags}
                    type="default"
                    size="sm"
                    clickable={true}
                    onTagClick={toggleTag}
                    selectedTags={selectedTags}
                />
            </div>

            {/* Show more/less button */}
            {filteredTags.length > (compact ? 8 : 15) && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-2 text-sm text-green-600 hover:text-green-800"
                >
                    {showAll ? 'Show less' : `Show all (${filteredTags.length})`}
                </button>
            )}
        </div>
    );
};

TagFilter.propTypes = {
    availableTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedTags: PropTypes.arrayOf(PropTypes.string),
    onTagsChange: PropTypes.func.isRequired,
    compact: PropTypes.bool
};

export default TagFilter;
