import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Plus, Trash2, Calendar, Hash, FileText } from 'lucide-react';
import { MetaTags } from '../components/MetaTags';
import { Modal } from '../components/Modal';
import type { PageRatio } from '../types';
import { pageRatios } from '../types';

interface Magazine {
  id: string;
  title: string;
  issue_number: string;
  publication_date: string;
  page_ratio: PageRatio;
  created_at: string;
  isShared?: boolean;
}

export function MagazineList() {
  const navigate = useNavigate();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [magazineToDelete, setMagazineToDelete] = useState<string | null>(null);
  const [newMagazine, setNewMagazine] = useState({
    title: '',
    issue_number: '1',
    publication_date: new Date().toISOString().split('T')[0],
    page_ratio: '1/1.4142' as PageRatio
  });

  useEffect(() => {
    const loadMagazines = () => {
      const storedMagazines = JSON.parse(localStorage.getItem('magazines') || '[]');
      setMagazines(storedMagazines);
      setLoading(false);
    };
    loadMagazines();
  }, []);

  const handleCreate = () => {
    const newMagazineData = {
      id: Math.random().toString(36).substr(2, 9),
      ...newMagazine,
      created_at: new Date().toISOString()
    };

    setMagazines(prev => {
      const updated = [...prev, newMagazineData];
      localStorage.setItem('magazines', JSON.stringify(updated));
      return updated;
    });

    setIsCreateModalOpen(false);
    setNewMagazine({
      title: '',
      issue_number: '1',
      publication_date: new Date().toISOString().split('T')[0],
      page_ratio: '1/1.4142'
    });
  };

  const handleDelete = () => {
    if (magazineToDelete) {
      setMagazines(prev => {
        const updated = prev.filter(m => m.id !== magazineToDelete);
        localStorage.setItem('magazines', JSON.stringify(updated));
        return updated;
      });
      setIsDeleteModalOpen(false);
      setMagazineToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Layout className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-gray-600">Loading magazines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <MetaTags title="My Magazines - FlatMag" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Magazines</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Magazine
          </button>
        </div>

        {magazines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No magazines yet</h3>
            <p className="text-gray-500 mb-4">Create your first magazine to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Magazine
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {magazines.map(magazine => (
              <div
                key={magazine.id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                  magazine.isShared ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {magazine.title}
                      </h3>
                      {magazine.isShared && (
                        <span className="text-xs text-blue-600 font-medium">
                          Shared with you
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setMagazineToDelete(magazine.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className={`text-gray-400 hover:text-red-600 ${
                        magazine.isShared ? 'hidden' : ''
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Hash className="w-4 h-4 mr-2" />
                      Issue {magazine.issue_number}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(magazine.publication_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-2" />
                      {pageRatios.find(r => r.value === magazine.page_ratio)?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/flat-plan/${magazine.id}`, { replace: true })}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Magazine Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Magazine
          </h2>
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newMagazine.title}
                onChange={(e) => setNewMagazine({ ...newMagazine, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xl h-10"
                placeholder="Enter magazine title"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="issue_number" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Number
              </label>
              <input
                type="text"
                id="issue_number"
                value={newMagazine.issue_number}
                onChange={(e) => setNewMagazine({ ...newMagazine, issue_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10"
                placeholder="e.g., 1, 2, Spring 2025, etc."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                id="publication_date"
                value={newMagazine.publication_date}
                onChange={(e) => setNewMagazine({ ...newMagazine, publication_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="page_ratio" className="block text-sm font-medium text-gray-700 mb-2">
                Page Ratio
              </label>
              <select
                id="page_ratio"
                value={newMagazine.page_ratio}
                onChange={(e) => setNewMagazine({ ...newMagazine, page_ratio: e.target.value as PageRatio })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10"
              >
                {pageRatios.map((ratio) => (
                  <option key={ratio.value} value={ratio.value}>
                    {ratio.name} ({ratio.description})
                  </option>
                ))}
              </select>
            </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newMagazine.title || !newMagazine.issue_number}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => {
        setIsDeleteModalOpen(false);
        setMagazineToDelete(null);
      }}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-red-600">Delete Magazine</h3>
            <p className="mt-2 text-sm text-gray-500">
              {magazineToDelete && magazines.find(m => m.id === magazineToDelete)?.isShared
                ? "Are you sure you want to remove this shared magazine from your list?"
                : "Are you sure you want to delete this magazine? This action cannot be undone."}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setMagazineToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              {magazineToDelete && magazines.find(m => m.id === magazineToDelete)?.isShared
                ? "Remove"
                : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}