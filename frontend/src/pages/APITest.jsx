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
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Backend API Test</h1>
          <p className="text-lg text-gray-600">Testing connection to Fashion Recommendation System backend</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${result.status === 'PASS' ? 'bg-green-50 border-green-500' :
                    result.status === 'FAIL' ? 'bg-red-50 border-red-500' :
                      result.status === 'INFO' || result.status === 'EXPECTED FAIL' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-gray-50 border-gray-500'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.test}</h3>
                    <p className={`text-sm ${result.status === 'PASS' ? 'text-green-700' :
                        result.status === 'FAIL' ? 'text-red-700' :
                          'text-yellow-700'
                      }`}>
                      Status: {result.status}
                    </p>
                    {result.error && (
                      <p className="text-sm text-gray-600 mt-1">Error: {result.error}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                {result.data && (
                  <div className="mt-3 p-3 bg-white rounded border text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {testResults.filter(r => r.status === 'PASS').length}
              </div>
              <div className="text-green-700">Passed Tests</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {testResults.filter(r => r.status === 'FAIL').length}
              </div>
              <div className="text-red-700">Failed Tests</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {testResults.length}
              </div>
              <div className="text-blue-700">Total Tests</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}