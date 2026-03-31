import React, { useState, useEffect } from 'react';

function Dashboard({ onLogout }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pool'); // 'pool', 'team', 'retired'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'Forward', jersey_number: '' });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
           const data = await response.json();
           setPlayers(data);
           setIsLoading(false);
        } else {
           // Fallback to empty array if DB lacks tables
           setIsLoading(false);
        }
      } catch (err) {
         console.error('Failed to fetch from API:', err);
         setIsLoading(false);
      }
    };

    fetchPlayers();
    
    // Poll the backend every 3.5 seconds to view the live morale simulation updates!
    const pollInterval = setInterval(fetchPlayers, 3500);
    return () => clearInterval(pollInterval);
  }, []);

  const movePlayer = async (id, targetList) => {
    // Optimistic UI update
    setPlayers(players.map(p => p.player_id === id ? { ...p, list: targetList } : p));
    
    try {
      await fetch(`/api/players/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetList })
      });
    } catch (err) {
      console.error("Failed to move player in DB:", err);
    }
  };

  const restPlayer = async (id) => {
    // Optimistic UI update for resting
    setPlayers(players.map(p => p.player_id === id ? { ...p, fitness_status: 'Match Fit', morale_rating: 10 } : p));
    
    try {
      await fetch(`/api/players/${id}/rest`, { method: 'PUT' });
    } catch (err) {
      console.error("Failed to rest player in DB:", err);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.jersey_number) return;
    
    const playerToAdd = {
      name: newPlayer.name,
      position: newPlayer.position,
      jersey_number: parseInt(newPlayer.jersey_number) || 0,
      fitness_status: 'Match Fit',
      morale_rating: 10,
      list: 'pool'
    };
    
    try {
       const res = await fetch('/api/players', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(playerToAdd)
       });
       const data = await res.json();
       if (data.success) {
           playerToAdd.player_id = data.insertId;
           setPlayers([...players, playerToAdd]);
           setNewPlayer({ name: '', position: 'Forward', jersey_number: '' });
           setShowAddForm(false);
       }
    } catch (err) {
       console.error("Failed to add to database:", err);
    }
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
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('/pitch-bg.jpg')" }}>
      <nav className="bg-slate-900/90 backdrop-blur text-white shadow-md border-b border-white/10">
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
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Squad Management</h1>
            <p className="mt-1 text-sm text-gray-200">Organize your first team, resting players, and view retirees.</p>
          </div>
          <div className="mt-4 sm:mt-0">
             <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
               {showAddForm ? 'Cancel' : 'Add New Player'}
             </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Player to Pool</h2>
            <form onSubmit={handleAddPlayer} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <input required type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Lionel Messi" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Forward</option>
                  <option>Midfielder</option>
                  <option>Defender</option>
                  <option>Goalkeeper</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number</label>
                <input required type="number" min="1" max="99" value={newPlayer.jersey_number} onChange={e => setNewPlayer({...newPlayer, jersey_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 10" />
              </div>
              <div className="sm:col-span-1">
                <button type="submit" className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm font-medium transition cursor-pointer">
                   Save Player
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-6 border-b border-white/20 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('pool')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pool' ? 'border-green-400 text-green-400 drop-shadow' : 'border-transparent text-gray-300 hover:text-white hover:border-white/50'}`}
          >
            Available Pool ({players.filter(p => p.list === 'pool').length})
          </button>
          <button 
            onClick={() => setActiveTab('team')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-green-400 text-green-400 drop-shadow' : 'border-transparent text-gray-300 hover:text-white hover:border-white/50'}`}
          >
            Current Team Members ({players.filter(p => p.list === 'team').length})
          </button>
          <button 
            onClick={() => setActiveTab('retired')} 
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'retired' ? 'border-green-400 text-green-400 drop-shadow' : 'border-transparent text-gray-300 hover:text-white hover:border-white/50'}`}
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
