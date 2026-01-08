import { Share, Platform } from 'react-native';

export const shareContent = async (options) => {
  const { title, message, url } = options;

  try {
    const result = await Share.share({
      title: title || 'NFA Mobile App',
      message: Platform.OS === 'ios' 
        ? `${message}${url ? `\n${url}` : ''}`
        : `${message}${url ? ` ${url}` : ''}`,
      url: Platform.OS === 'ios' ? url : undefined
    });

    if (result.action === Share.sharedAction) {
      return { success: true };
    } else if (result.action === Share.dismissedAction) {
      return { success: false, dismissed: true };
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return { success: false, error };
  }
};

export const shareMatch = async (match) => {
  const message = `${match.home_team} vs ${match.away_team}\n${match.competition || 'Match'}`;
  return shareContent({
    title: 'Match Update',
    message,
    url: `nfa://match/${match.id}`
  });
};

export const shareNews = async (article) => {
  return shareContent({
    title: article.title,
    message: `${article.title}\n\n${article.summary || article.body || ''}`,
    url: `nfa://news/${article.id}`
  });
};

export const sharePlayer = async (player) => {
  const message = `${player.full_name || player.name}\n${player.position || 'Player'}\n${player.team_name || ''}`;
  return shareContent({
    title: 'Player Profile',
    message,
    url: `nfa://player/${player.id}`
  });
};


