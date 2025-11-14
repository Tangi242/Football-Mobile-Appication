import PropTypes from 'prop-types';

const TeamOverview = ({ home, away }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-white">
    {[home, away].map((team) => (
    <div
      key={team.name}
      className="bg-white border border-[#d7dff7] rounded-2xl p-5 flex flex-col gap-3 shadow-md"
    >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">{team.code}</p>
            <h3 className="text-2xl font-bold">{team.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-3xl">{team.rating.toFixed(2)}</span>
            <span className="text-xs uppercase text-white/60">rating</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="uppercase text-white">{team.formation}</span>
            <span className="text-white/50">Formation</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-md border border-white/20"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-white/50">Kit color</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

TeamOverview.propTypes = {
  home: PropTypes.object,
  away: PropTypes.object
};

export default TeamOverview;

