import PropTypes from 'prop-types';

const columns = ['POS', 'TEAM', 'PLD', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'];

const StandingsTable = ({ standings }) => (
  <div className="bg-white border border-[#d7dff7] rounded-3xl p-6 text-[#0f172a] shadow-xl">
    <p className="text-sm uppercase tracking-widest text-white/60">Current Standings</p>
    <div className="grid grid-cols-10 text-xs uppercase text-[#94a3b8] pb-2 border-b border-[#e4e9fb] mt-2">
      {columns.map((col) => (
        <span key={col} className={col === 'TEAM' ? 'col-span-2' : ''}>
          {col}
        </span>
      ))}
    </div>
    <div className="divide-y divide-[#e4e9fb]">
      {standings.map((row, idx) => (
        <div key={row.team} className="grid grid-cols-10 py-3 text-sm items-center">
          <span className="font-bold text-[#475569]">{idx + 1}</span>
          <span className="col-span-2 font-semibold">{row.team}</span>
          <span className="text-[#475569]">{row.played}</span>
          <span>{row.wins}</span>
          <span>{row.draws}</span>
          <span>{row.losses}</span>
          <span>{row.gf ?? 0}</span>
          <span>{row.ga ?? 0}</span>
          <span>{row.gd ?? (row.gf ?? 0) - (row.ga ?? 0)}</span>
          <span className="font-black text-yellow text-lg">{row.points}</span>
        </div>
      ))}
    </div>
  </div>
);

StandingsTable.propTypes = {
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      team: PropTypes.string,
      played: PropTypes.number,
      wins: PropTypes.number,
      draws: PropTypes.number,
      losses: PropTypes.number,
      points: PropTypes.number,
      gf: PropTypes.number,
      ga: PropTypes.number,
      gd: PropTypes.number
    })
  )
};

export default StandingsTable;

