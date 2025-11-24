'use client';

/**
 * WSJF Calculator Component
 * Interactive calculator for Weighted Shortest Job First prioritization
 */

import { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

interface WSJFItem {
  id: string;
  name: string;
  userValue: number;
  timeCriticality: number;
  riskReduction: number;
  jobSize: number;
}

export function WSJFCalculator() {
  const [items, setItems] = useState<WSJFItem[]>([
    { id: '1', name: 'Feature 1', userValue: 5, timeCriticality: 5, riskReduction: 5, jobSize: 5 },
  ]);

  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems([
      ...items,
      { id: newId, name: `Feature ${newId}`, userValue: 5, timeCriticality: 5, riskReduction: 5, jobSize: 5 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof WSJFItem, value: number | string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateWSJF = (item: WSJFItem) => {
    const costOfDelay = item.userValue + item.timeCriticality + item.riskReduction;
    return item.jobSize > 0 ? costOfDelay / item.jobSize : 0;
  };

  const sortedItems = [...items].sort((a, b) => calculateWSJF(b) - calculateWSJF(a));

  const resetAll = () => {
    setItems([
      { id: '1', name: 'Feature 1', userValue: 5, timeCriticality: 5, riskReduction: 5, jobSize: 5 },
    ]);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h3 className="font-semibold">WSJF Calculator</h3>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-1 text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Calculator Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Feature</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">User Value</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Time Critical</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Risk Reduction</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20">CoD</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Job Size</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20">WSJF</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Rank</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => {
              const costOfDelay = item.userValue + item.timeCriticality + item.riskReduction;
              const wsjf = calculateWSJF(item);
              const rank = sortedItems.findIndex(i => i.id === item.id) + 1;

              return (
                <tr key={item.id} className={rank === 1 ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.userValue}
                      onChange={(e) => updateItem(item.id, 'userValue', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-800 dark:border-gray-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.timeCriticality}
                      onChange={(e) => updateItem(item.id, 'timeCriticality', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-800 dark:border-gray-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.riskReduction}
                      onChange={(e) => updateItem(item.id, 'riskReduction', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-800 dark:border-gray-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-medium bg-blue-50 dark:bg-blue-900/20">
                    {costOfDelay}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.jobSize}
                      onChange={(e) => updateItem(item.id, 'jobSize', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-800 dark:border-gray-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400 bg-green-50 dark:bg-green-900/20">
                    {wsjf.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rank === 1 ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                        #1
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">#{rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          + Add Feature
        </button>
      </div>

      {/* Results Summary */}
      {items.length > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Priority Order:</h4>
          <ol className="list-decimal list-inside space-y-1">
            {sortedItems.map((item, index) => (
              <li key={item.id} className={`text-sm ${index === 0 ? 'font-bold text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {item.name} (WSJF: {calculateWSJF(item).toFixed(2)})
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
