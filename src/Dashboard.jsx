import React, { useState, useEffect } from 'react';

function Dashboard({ onLogout }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pool'); // 'pool', 'team', 'retired'

  // Mock data perfectly mirroring Phase 1 SQL insertions
  const MOCK_DB_DATA = [
    { player_id: 1, name: 'Marcus Sterling', position: 'Forward', jersey_number: 9, fitness_status: 'Match Fit', morale_rating: 9 },
    { player_id: 2, name: 'Julian Alvarez', position: 'Forward', jersey_number: 11, fitness_status: 'Injured', morale_rating: 4 },
    { player_id: 3, name: 'Kevin De Silva', position: 'Midfielder', jersey_number: 10, fitness_status: 'Match Fit', morale_rating: 8 },
    { player_id: 4, name: 'Enzo Fernandez', position: 'Midfielder', jersey_number: 8, fitness_status: 'Suspended', morale_rating: 5 },
    { player_id: 5, name: 'Virgil Van Berg', position: 'Defender', jersey_number: 4, fitness_status: 'Match Fit', morale_rating: 10 },
    { player_id: 6, name: 'Ruben Dias', position: 'Defender', jersey_number: 3, fitness_status: 'In Rehab', morale_rating: 6 },
    { player_id: 7, name: 'Trent James', position: 'Defender', jersey_number: 66, fitness_status: 'Match Fit', morale_rating: 7 },
    { player_id: 8, name: 'Alisson Ederson', position: 'Goalkeeper', jersey_number: 1, fitness_status: 'Match Fit', morale_rating: 9 },
  ];

  useEffect(() => {
    // Simulating an API fetch operation
    const fetchPlayers = () => {
      setTimeout(() => {
        // Initialize all players in the 'pool' list
        const initialPlayers = MOCK_DB_DATA.map(p => ({ ...p, list: 'pool' }));
        setPlayers(initialPlayers);
        setIsLoading(false);
      }, 800);
    };

    fetchPlayers();
  }, []);

  const movePlayer = (id, targetList) => {
    setPlayers(players.map(p => p.player_id === id ? { ...p, list: targetList } : p));
  };

  const restPlayer = (id) => {
    setPlayers(players.map(p => p.player_id === id ? { ...p, fitness_status: 'Match Fit', morale_rating: 10 } : p));
  };

  const getFitnessBadgeColor = (status) => {
    switch (status) {
      case 'Match Fit': return 'bg-green-100 text-green-800 border-green-200';
      case 'Injured': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Rehab': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentPlayers = players.filter(p => p.list === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-wider">Manager Dashboard</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1 text-sm font-medium text-slate-300 transition-colors bg-slate-800 rounded hover:bg-slate-700 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Squad Management</h1>
            <p className="mt-1 text-sm text-gray-500">Organize your first team, resting players, and view retirees.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('pool')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pool' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Available Pool ({players.filter(p => p.list === 'pool').length})
          </button>
          <button 
            onClick={() => setActiveTab('team')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Current Team Members ({players.filter(p => p.list === 'team').length})
          </button>
          <button 
            onClick={() => setActiveTab('retired')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'retired' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Retired Players ({players.filter(p => p.list === 'retired').length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500 animate-pulse">Loading tactical data...</div>
          </div>
        ) : (
          <div>
            {currentPlayers.length === 0 && activeTab !== 'team' ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
                <span className="text-gray-400 text-lg">No players found in this category.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentPlayers.map((player) => (
                  <div key={player.player_id} className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center w-10 h-10 font-bold text-indigo-700 bg-indigo-100 rounded-full">
                          {player.jersey_number}
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getFitnessBadgeColor(player.fitness_status)}`}>
                          {player.fitness_status}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{player.name}</h3>
                        <p className="text-sm font-medium text-gray-500">{player.position}</p>
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase">Morale</span>
                        <div className="flex items-center">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                             <div 
                               className={`h-full ${player.morale_rating >= 7 ? 'bg-green-500' : player.morale_rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                               style={{ width: `${player.morale_rating * 10}%` }}
                             />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{player.morale_rating}/10</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid gap-2 pt-2 border-t border-gray-200">
                        {player.list === 'pool' && (
                          <button onClick={() => movePlayer(player.player_id, 'team')} className="w-full py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition duration-150">
                            Add to Team
                          </button>
                        )}
                        {player.list === 'team' && (
                          <button onClick={() => movePlayer(player.player_id, 'pool')} className="w-full py-1.5 text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 rounded transition duration-150">
                            Remove from Team
                          </button>
                        )}
                        {player.list !== 'retired' && (
                          <div className="flex gap-2">
                            <button onClick={() => restPlayer(player.player_id)} className="flex-1 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded transition duration-150">
                              Allow Rest
                            </button>
                            <button onClick={() => movePlayer(player.player_id, 'retired')} className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded transition duration-150">
                              Retire
                            </button>
                          </div>
                        )}
                        {player.list === 'retired' && (
                          <button onClick={() => movePlayer(player.player_id, 'pool')} className="w-full py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition duration-150">
                            Return to Pool
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeTab === 'team' && Array.from({ length: Math.max(0, 11 - currentPlayers.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-6 bg-slate-50/20 border-2 border-dashed border-gray-300 rounded-lg min-h-[240px]">
                    <div className="flex flex-col items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full">
                       <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                    </div>
                    <span className="text-gray-400 font-medium">Empty Slot</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
