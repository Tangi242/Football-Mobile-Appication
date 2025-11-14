import PropTypes from 'prop-types';
import clsx from 'clsx';
import dayjs from 'dayjs';

const tabs = ['Lineups', 'Standings'];

const MatchHeader = ({ matches, activeMatch, onMatchChange, activeTab, onTabChange }) => {
  if (!activeMatch) return null;
  const date = dayjs(activeMatch.kickoff).format('ddd, MMM D • HH:mm');

  return (
    <header className="bg-white rounded-3xl p-6 shadow-xl border border-[#d7dff7]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#5b6478]">{activeMatch.title}</p>
          <h1 className="text-3xl font-black text-[#0f172a] mt-1">
            {activeMatch.teams.home.name} vs {activeMatch.teams.away.name}
          </h1>
          <p className="text-[#4b5563] text-sm">{date} • {activeMatch.venue}</p>
        </div>
        <select
          value={activeMatch.id}
          onChange={(e) => onMatchChange(e.target.value)}
          className="bg-white border border-[#d7dff7] text-[#0f172a] text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.teams.home.name} vs {match.teams.away.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={clsx(
              'pb-2 text-lg font-semibold border-b-2 transition-colors',
              tab === activeTab ? 'border-blue text-white' : 'border-transparent text-white/60 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
};

MatchHeader.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeMatch: PropTypes.object,
  onMatchChange: PropTypes.func.isRequired,
  activeTab: PropTypes.oneOf(tabs).isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default MatchHeader;

