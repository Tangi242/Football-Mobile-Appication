import { useEffect, useMemo, useState } from 'react';
import MatchHeader from './components/MatchHeader.jsx';
import FiltersBar from './components/FiltersBar.jsx';
import TeamOverview from './components/TeamOverview.jsx';
import PitchLayout from './components/PitchLayout.jsx';
import StandingsTable from './components/StandingsTable.jsx';
import matches from './data/matches.json';
import { getAssetUrl } from './utils/getAssetUrl.js';
import './index.css';

const tabs = ['Lineups', 'Standings'];

function App() {
  const [matchId, setMatchId] = useState(matches[0].id);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [filter, setFilter] = useState(matches[0].filters[0]);

  const activeMatch = useMemo(() => matches.find((match) => match.id === matchId), [matchId]);

  useEffect(() => {
    if (activeMatch) {
      setFilter(activeMatch.filters[0]);
    }
  }, [activeMatch]);

  const heroImage = getAssetUrl(activeMatch?.heroImage || 'match_banner1.jpg');

  return (
    <div className="min-h-screen text-[#0f172a] pb-16 bg-[#f3f6ff]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-12 space-y-8">
        <MatchHeader
          matches={matches}
          activeMatch={activeMatch}
          onMatchChange={setMatchId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'Lineups' && (
          <section className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative overflow-hidden rounded-3xl border border-white/10 bg-[#1d3270]/90 p-6 shadow-inner">
              <img
                src={heroImage}
                alt="Match banner"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative">
                <p className="uppercase tracking-widest text-sm text-white/50">Possible lineups</p>
                <h2 className="text-3xl font-black">Performance radar</h2>
              </div>
              <div className="relative">
                <FiltersBar filters={activeMatch.filters} activeFilter={filter} onChange={setFilter} />
              </div>
            </div>
            <TeamOverview home={activeMatch.teams.home} away={activeMatch.teams.away} />
            <PitchLayout homeTeam={activeMatch.teams.home} awayTeam={activeMatch.teams.away} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeMatch.details.map((detail, index) => {
                const cardBg =
                  index === 0 && activeMatch.stadiumImage
                    ? {
                        backgroundImage: `linear-gradient(135deg, rgba(21,42,87,0.85), rgba(21,42,87,0.85)), url(${getAssetUrl(activeMatch.stadiumImage)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : {};
                return (
                  <div
                    key={detail.label}
                    className="bg-[#1f3570] border border-white/10 rounded-2xl p-5 shadow-lg"
                    style={cardBg}
                  >
                    <p className="text-sm uppercase tracking-widest text-white/40">{detail.label}</p>
                    <p className="text-xl font-semibold mt-2">{detail.value}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'Standings' && (
          <section className="space-y-6">
            <StandingsTable standings={activeMatch.standings} />
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
