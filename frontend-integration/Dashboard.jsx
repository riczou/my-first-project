import React, { useState, useEffect } from 'react';
import apiClient from './apiClient';

/**
 * Dashboard Component
 * Copy this to your Lovable project and customize the styling
 */
const Dashboard = ({ user, onLogout }) => {
  const [connections, setConnections] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load connections and platforms in parallel
      const [connectionsData, platformsData] = await Promise.all([
        apiClient.getConnections(),
        apiClient.getPlatforms(),
      ]);
      
      setConnections(connectionsData);
      setPlatforms(platformsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    onLogout();
  };

  const handleDeleteConnection = async (connectionId) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        await apiClient.deleteConnection(connectionId);
        // Refresh connections list
        const updatedConnections = await apiClient.getConnections();
        setConnections(updatedConnections);
      } catch (error) {
        console.error('Failed to delete connection:', error);
        alert('Failed to delete connection. Please try again.');
      }
    }
  };

  const handleConnectPlatform = async (platformId) => {
    const platformUsername = prompt('Enter your username for this platform:');
    if (platformUsername) {
      try {
        await apiClient.connectPlatform(platformId, {
          platform_username: platformUsername,
          platform_id: platformId,
        });
        alert('Platform connected successfully!');
      } catch (error) {
        console.error('Failed to connect platform:', error);
        alert('Failed to connect platform. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {user.first_name}!</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="dashboard-content">
        {/* User Stats */}
        <div className="stats-section" style={{ marginBottom: '2rem' }}>
          <h2>Your Network Stats</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#007bff' }}>{connections.length}</h3>
              <p style={{ margin: 0 }}>Total Connections</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#28a745' }}>{platforms.length}</h3>
              <p style={{ margin: 0 }}>Available Platforms</p>
            </div>
          </div>
        </div>

        {/* Platforms Section */}
        <div className="platforms-section" style={{ marginBottom: '2rem' }}>
          <h2>Connect Your Platforms</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {platforms.map((platform) => (
              <div
                key={platform.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <h4>{platform.name}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  {platform.is_active ? 'Available' : 'Coming Soon'}
                </p>
                {platform.is_active && (
                  <button
                    onClick={() => handleConnectPlatform(platform.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connections Section */}
        <div className="connections-section">
          <h2>Your Connections</h2>
          {connections.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No connections yet. Start by connecting to a platform above!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <h4>{connection.connection_name}</h4>
                  {connection.connection_title && (
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      {connection.connection_title}
                    </p>
                  )}
                  {connection.connection_company && (
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      {connection.connection_company}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      Strength: {connection.relationship_strength}/5
                    </span>
                    <button
                      onClick={() => handleDeleteConnection(connection.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;