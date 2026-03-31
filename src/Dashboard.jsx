import React, { useState, useEffect } from 'react';

function Dashboard({ onLogout }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // In a real application, this would be:
    // fetch('/api/players')
    //   .then(res => res.json())
    //   .then(data => setPlayers(data))
    //   .catch(err => console.error(err));
    
    const fetchPlayers = () => {
      setTimeout(() => {
        setPlayers(MOCK_DB_DATA);
        setIsLoading(false);
      }, 800); // Simulate network delay
    };

    fetchPlayers();
  }, []);

  const getFitnessBadgeColor = (status) => {
    switch (status) {
      case 'Match Fit': return 'bg-green-100 text-green-800 border-green-200';
      case 'Injured': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Rehab': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
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
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">First Team Squad</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time overview of player statuses and availability.</p>
          </div>
        </div>

        {/* Squad Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500 animate-pulse">Loading tactical data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {players.map((player) => (
              <div key={player.player_id} className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase">Morale</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                         <div 
                           className={`h-full ${player.morale_rating >= 7 ? 'bg-green-500' : player.morale_rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                           style={{ width: `${player.morale_rating * 10}%` }}
                         />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{player.morale_rating}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
