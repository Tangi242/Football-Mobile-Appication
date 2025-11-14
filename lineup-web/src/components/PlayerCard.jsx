import PropTypes from 'prop-types';
import clsx from 'clsx';
import { getAssetUrl } from '../utils/getAssetUrl.js';

const PlayerCard = ({ player, side = 'home' }) => {
  if (!player) return null;
  const photoSrc = getAssetUrl(player.photo) || getAssetUrl('player1.jpg');
  return (
    <div
      className={clsx(
        'flex flex-col items-center text-center gap-1 transition-all duration-200',
        side === 'home' ? 'text-white' : 'text-white'
      )}
    >
      <div className="relative">
        <img
          src={photoSrc}
          alt={player.name}
          className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-lg"
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-tight">{player.position}</p>
        <p className="text-sm font-bold whitespace-nowrap">{player.name}</p>
      </div>
    </div>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    photo: PropTypes.string
  }),
  side: PropTypes.oneOf(['home', 'away'])
};

export default PlayerCard;

