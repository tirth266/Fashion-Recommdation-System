import { useState, useEffect } from 'react';
import fashionAPI from '../services/api';

export default function APITest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, data = null, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Health check
      try {
        const health = await fetch('/api/health');
        const healthData = await health.json();
        addResult('Health Check', 'PASS', healthData);
      } catch (error) {
        addResult('Health Check', 'FAIL', null, error.message);
      }

      // Test 2: Initialize mock data
      try {
        const mockData = await fashionAPI.initMockData();
        addResult('Initialize Mock Data', 'PASS', mockData);
      } catch (error) {
        addResult('Initialize Mock Data', 'INFO', null, error.message);
      }

      // Test 3: Get categories
      try {
        const categories = await fashionAPI.getCategories();
        addResult('Get Categories', 'PASS', categories);
      } catch (error) {
        addResult('Get Categories', 'FAIL', null, error.message);
      }

      // Test 4: Get brands
      try {
        const brands = await fashionAPI.getBrands();
        addResult('Get Brands', 'PASS', brands);
      } catch (error) {
        addResult('Get Brands', 'FAIL', null, error.message);
      }

      // Test 5: Text search
      try {
        const searchResults = await fashionAPI.textSearch('jeans');
        addResult('Text Search', 'PASS', searchResults);
      } catch (error) {
        addResult('Text Search', 'FAIL', null, error.message);
      }

      // Test 6: Size chart
      try {
        const sizeChart = await fashionAPI.getSizeChart();
        addResult('Get Size Chart', 'PASS', sizeChart);
      } catch (error) {
        addResult('Get Size Chart', 'FAIL', null, error.message);
      }

      // Test 7: Register (should fail without proper data)
      try {
        await fashionAPI.register({ username: 'test', email: 'test@test.com', password: 'test' });
        addResult('User Registration', 'PASS', 'Registration successful');
      } catch (error) {
        addResult('User Registration', 'EXPECTED FAIL', null, error.message);
      }

    } catch (error) {
      addResult('Overall Test Suite', 'ERROR', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12 transition-colors duration-300 grid-bg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Backend API Test</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Testing connection to Fashion Recommendation System backend</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Results</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${result.status === 'PASS' ? 'bg-green-50 border-green-500 dark:bg-green-900/20' :
                  result.status === 'FAIL' ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                    result.status === 'INFO' || result.status === 'EXPECTED FAIL' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' :
                      'bg-gray-50 border-gray-500 dark:bg-gray-700 dark:border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{result.test}</h3>
                    <p className={`text-sm ${result.status === 'PASS' ? 'text-green-700 dark:text-green-400' :
                      result.status === 'FAIL' ? 'text-red-700 dark:text-red-400' :
                        'text-yellow-700 dark:text-yellow-400'
                      }`}>
                      Status: {result.status}
                    </p>
                    {result.error && (
                      <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">Error: {result.error}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{result.timestamp}</span>
                </div>
                {result.data && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Backend Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {testResults.filter(r => r.status === 'PASS').length}
              </div>
              <div className="text-green-700 dark:text-green-300">Passed Tests</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                {testResults.filter(r => r.status === 'FAIL').length}
              </div>
              <div className="text-red-700 dark:text-red-300">Failed Tests</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {testResults.length}
              </div>
              <div className="text-blue-700 dark:text-blue-300">Total Tests</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}