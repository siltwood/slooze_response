import { useState, useEffect } from 'react'
import './App.css'

interface ApiResponse {
  message: string;
  data?: {
    users: string[];
    version: string;
  };
  status?: string;
  timestamp?: string;
}

function App() {
  const [backendData, setBackendData] = useState<ApiResponse | null>(null);
  const [healthData, setHealthData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackendData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/hello');
      if (!response.ok) throw new Error('Failed to fetch backend data');
      const data = await response.json();
      setBackendData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            🚀 Slooze
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern full-stack application built with React, TypeScript, Tailwind CSS, and Express.js
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Health Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🔍 Backend Health
              </h2>
              {healthData ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-700 font-medium">{healthData.status}</span>
                  </div>
                  <p className="text-gray-600">{healthData.message}</p>
                  <p className="text-sm text-gray-500">
                    Last checked: {healthData.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-yellow-700">Checking...</span>
                </div>
              )}
            </div>

            {/* API Data Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                📊 API Data
              </h2>
              <button
                onClick={fetchBackendData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors mb-4"
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </button>
              
              {backendData && (
                <div className="space-y-3">
                  <p className="text-gray-700">{backendData.message}</p>
                  {backendData.data && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Users:</h3>
                      <div className="flex flex-wrap gap-2">
                        {backendData.data.users.map((user, index) => (
                          <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {user}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Version: {backendData.data.version}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-500">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error occurred
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    <p className="mt-1 text-xs">
                      Make sure the backend server is running on http://localhost:3001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              ✨ Features Included
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  ⚛️
                </div>
                <h3 className="font-semibold text-gray-800">React 18</h3>
                <p className="text-gray-600 text-sm">Modern React with hooks</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  🔷
                </div>
                <h3 className="font-semibold text-gray-800">TypeScript</h3>
                <p className="text-gray-600 text-sm">Type-safe development</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  🎨
                </div>
                <h3 className="font-semibold text-gray-800">Tailwind CSS</h3>
                <p className="text-gray-600 text-sm">Utility-first styling</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  🚀
                </div>
                <h3 className="font-semibold text-gray-800">Express.js</h3>
                <p className="text-gray-600 text-sm">Fast backend API</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  ⚡
                </div>
                <h3 className="font-semibold text-gray-800">Vite</h3>
                <p className="text-gray-600 text-sm">Lightning fast HMR</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  🔧
                </div>
                <h3 className="font-semibold text-gray-800">Dev Ready</h3>
                <p className="text-gray-600 text-sm">Concurrent development</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
