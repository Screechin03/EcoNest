import React from 'react';
import PropTypes from 'prop-types';
import { FaTags } from 'react-icons/fa';

/**
 * Component to display tag count with an icon on property listings
 * 
 * @param {Object} props Component props
 * @param {Number} props.count Number of tags
 * @param {String} props.size Size of tag count ('sm', 'md')
 */
const TagCount = ({ count, size = 'md' }) => {
    if (!count || count <= 0) return null;

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-3 py-1';

    return (
        <div className={`flex items-center gap-1 ${sizeClasses} bg-green-50 text-green-700 rounded-full border border-green-200`}>
            <FaTags className="text-green-600" size={size === 'sm' ? 10 : 14} />
            <span>{count} {count === 1 ? 'Feature' : 'Features'}</span>
        </div>
    );
};

TagCount.propTypes = {
    count: PropTypes.number.isRequired,
    size: PropTypes.oneOf(['sm', 'md'])
};

export default TagCount;
