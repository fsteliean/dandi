export default function PlanCard() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-medium text-gray-200 uppercase tracking-wide">CURRENT PLAN</h2>
          <h1 className="text-2xl font-bold text-white mt-1">Researcher</h1>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">API Limit</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-orange-400 h-2 rounded-full" 
                style={{ width: '2.4%' }}
              ></div>
            </div>
            <p className="text-sm text-white mt-2">24 / 1,000 Requests</p>
          </div>
        </div>
        <button className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors text-sm font-medium">
          Manage Plan
        </button>
      </div>
    </div>
  );
}
