import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
     const { currentUser } = useAuth();

     return (
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
               <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                         <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-10 text-white">
                              <h1 className="text-3xl font-bold">Dashboard</h1>
                              <p className="mt-2 text-purple-100">Manage your fashion preferences and recommendations</p>
                         </div>

                         <div className="px-8 py-10">
                              <div className="flex items-center space-x-6 mb-10">
                                   <img
                                        src={currentUser?.photoURL}
                                        alt={currentUser?.displayName}
                                        className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                   />
                                   <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.displayName}!</h2>
                                        <p className="text-gray-500">{currentUser?.email}</p>
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                   {/* Card 1 */}
                                   <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                             </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Items</h3>
                                        <p className="text-gray-600 mb-4">View and manage your saved fashion items.</p>
                                        <div className="text-3xl font-bold text-purple-600">12</div>
                                   </div>

                                   {/* Card 2 */}
                                   <div className="bg-pink-50 rounded-xl p-6 border border-pink-100 hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 text-pink-600">
                                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                             </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Searches</h3>
                                        <p className="text-gray-600 mb-4">Access your history and previous comparisons.</p>
                                        <div className="text-3xl font-bold text-pink-600">5</div>
                                   </div>

                                   {/* Card 3 */}
                                   <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                             </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Profile</h3>
                                        <p className="text-gray-600 mb-4">Update your preferences and measurements.</p>
                                        <button onClick={() => window.location.href = '/profile'} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Edit Profile &rarr;</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
