import PropTypes from 'prop-types';
import PlayerCard from './PlayerCard.jsx';

const PitchLayout = ({ homeTeam, awayTeam }) => {
  const renderPlayers = (team, side) =>
    team.players.map((player) => (
      <div
        key={player.id}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${player.x}%`, top: `${player.y}%` }}
      >
        <PlayerCard player={player} side={side} />
      </div>
    ));

  return (
    <div className="relative w-full rounded-[32px] bg-gradient-to-b from-green-900 via-green-800 to-green-900 overflow-hidden border border-white/10 shadow-2xl">
      <div className="relative aspect-[2/1]">
        <div className="absolute inset-0 border-4 border-white/20 rounded-[32px]" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/30" />
        <div className="absolute inset-y-6 left-6 right-6 border border-white/20 rounded-[32px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute inset-y-16 left-10 w-24 border-2 border-white/25 rounded-[40px]" />
        <div className="absolute inset-y-16 right-10 w-24 border-2 border-white/25 rounded-[40px]" />
        {renderPlayers(homeTeam, 'home')}
        {renderPlayers(awayTeam, 'away')}
      </div>
    </div>
  );
};

PitchLayout.propTypes = {
  homeTeam: PropTypes.object,
  awayTeam: PropTypes.object
};

export default PitchLayout;

