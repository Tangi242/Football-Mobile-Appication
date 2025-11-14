import PropTypes from 'prop-types';
import clsx from 'clsx';

const FiltersBar = ({ filters, activeFilter, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {filters.map((filter) => (
      <button
        key={filter}
        onClick={() => onChange(filter)}
        className={clsx(
          'px-4 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm',
          filter === activeFilter
            ? 'bg-[#0B5FFF] text-white border-[#0B5FFF] shadow-lg shadow-blue/30'
            : 'bg-white border-[#d7dff7] text-[#4b5563] hover:border-[#adc1ff]'
        )}
      >
        {filter}
      </button>
    ))}
  </div>
);

FiltersBar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.string),
  activeFilter: PropTypes.string,
  onChange: PropTypes.func
};

export default FiltersBar;

