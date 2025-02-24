import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MetaTags } from '../components/MetaTags';
import { Modal } from '../components/Modal';
import { HistoryPanel } from '../components/HistoryPanel';
import { DeleteConfirmation } from '../components/DeleteConfirmation';
import { MagazineSettings } from '../components/MagazineSettings';
import { Toolbar } from '../components/Toolbar';
import { MainContent } from '../components/MainContent';
import { CollaborationStatus } from '../components/CollaborationStatus';
import { CursorOverlay } from '../components/CursorOverlay';
import { ArticleForm } from '../components/ArticleForm';
import { Loader } from '../components/Loader';
import type { Article } from '../types';
import type { RootState } from '../store/store';
import { initializeCollaboration, joinSession, getSessionId, isCollaborating, getConnectedPeers } from '../utils/collaboration';
import { addArticle, updateArticle, deleteArticle, setPages, undo, redo, setShowList, setConnectionStatus, syncState } from '../store/magazineSlice';

function LoadingView() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Loader />
    </div>
  );
}

export function FlatPlan() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { articles, pages, showList, zoomLevel, isShared, allowEdit, isConnecting } = useSelector((state: RootState) => state.magazine);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [collaborationStatus, setCollaborationStatus] = useState({
    isCollaborating: false,
    peersCount: 0
  });

  useEffect(() => {
    const loadMagazine = async () => {
      if (!id) return;
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
        const magazine = magazines.find((m: any) => m.id === id);
        
        if (!magazine) {
          throw new Error('Magazine not found');
        }

        // Initialize collaboration
        initializeCollaboration();

        // Check URL for collaboration session
        const sessionId = location.state?.session;
        const mode = location.state?.mode;
        
        if (sessionId && mode) {
          console.log('Joining collaboration session:', sessionId);
          dispatch(setConnectionStatus(true));
          await joinSession(sessionId);
          dispatch(setConnectionStatus(false));
        }

        // Initialize magazine state
        dispatch(syncState({
          magazine: magazine.state || {
            articles: [],
            pages: 4,
            pageMargins: {},
            zoomLevel: '2',
            showList: true,
            isShared: false,
            allowEdit: true,
            isConnecting: false,
            history: {
              past: [],
              future: []
            }
          }
        }));

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading magazine:', error);
        setLoadError('Failed to load magazine');
        setIsLoading(false);
      }
    };

    loadMagazine();
  }, [id, dispatch, location.state]);

  useEffect(() => {
    const maxPage = articles.reduce((max, article) => {
      const endPage = article.startPage + article.pageCount - 1;
      return Math.max(max, endPage);
    }, 0);
    
    if (maxPage > pages) {
      dispatch(setPages(maxPage));
    }
  }, [articles, pages, dispatch]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const viewParam = url.searchParams.get('view');
    if (viewParam === 'list' || viewParam === 'grid') {
      dispatch(setShowList(viewParam === 'list'));
    }
  }, [dispatch]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', showList ? 'list' : 'grid');
    window.history.replaceState({}, '', url.toString());
  }, [showList]);

  useEffect(() => {
    // Update collaboration status periodically
    const interval = setInterval(() => {
      setCollaborationStatus({
        isCollaborating: isCollaborating(),
        peersCount: getConnectedPeers()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateStartPage = (newArticle: Omit<Article, 'id' | 'startPage'>) => {
    if (articles.length === 0) return 1;
    
    const lastArticle = [...articles].sort((a, b) => {
      const aEndPage = a.startPage + a.pageCount - 1;
      const bEndPage = b.startPage + b.pageCount - 1;
      return bEndPage - aEndPage;
    })[0];

    return lastArticle.startPage + lastArticle.pageCount;
  };

  const handleAddArticle = (newArticle: Omit<Article, 'id' | 'startPage'>) => {
    if (editingArticle) {
      dispatch(updateArticle({
        ...editingArticle,
        ...newArticle,
        id: editingArticle.id,
        startPage: editingArticle.startPage
      }));
      setEditingArticle(null);
    } else {
      const startPage = calculateStartPage(newArticle);
      dispatch(addArticle({
        ...newArticle,
        id: Math.random().toString(36).substr(2, 9),
        startPage,
        isLocked: false
      }));
    }
    setIsModalOpen(false);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    dispatch(updateArticle(updatedArticle));
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleDeleteArticle = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      setArticleToDelete(article);
    }
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      dispatch(deleteArticle(articleToDelete.id));
      setArticleToDelete(null);
      setIsModalOpen(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = articles.findIndex(item => item.id === active.id);
      const newIndex = articles.findIndex(item => item.id === over.id);

      // First pass: Calculate new start pages
      let currentPage = 1;
      const updatedArticles = [...articles];
      const [movedArticle] = updatedArticles.splice(oldIndex, 1);
      updatedArticles.splice(newIndex, 0, movedArticle);

      const reorderedArticles = updatedArticles.map(article => {
        const newArticle = {
          ...article,
          startPage: currentPage
        };
        currentPage += article.pageCount;
        return newArticle;
      });

      // Update all articles in a single batch
      dispatch({
        type: 'magazine/reorderArticles',
        payload: reorderedArticles
      });
    }
  };

  const handleAddPage = () => {
    dispatch(setPages(pages + 1));
  };

  const handleRemovePage = () => {
    if (pages > 1) {
      dispatch(setPages(pages - 1));
      articles.forEach(article => {
        if (article.startPage === pages) {
          dispatch(updateArticle({
            ...article,
            startPage: pages - 1
          }));
        }
      });
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch(redo());
        } else {
          dispatch(undo());
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        dispatch(redo());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch]);

  if (isConnecting || isLoading) {
    return <LoadingView />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => navigate('/magazines')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Back to Magazines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <MetaTags 
        title="FlatMag Editor"
        description="Create and manage your magazine layouts with our intuitive drag-and-drop editor. Collaborate with your team in real-time."
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900">Magazine Layout</h2>
            <CollaborationStatus 
              isCollaborating={collaborationStatus.isCollaborating}
              peersCount={collaborationStatus.peersCount}
              isEditingAllowed={allowEdit}
            />
          </div>
          <Toolbar
            showList={showList}
            onHistoryClick={() => setIsHistoryOpen(!isHistoryOpen)}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onFlipbookClick={() => setShowFlipbook(true)}
            onViewToggle={() => dispatch(setShowList(!showList))}
          />
        </div>

        <MainContent
          showList={showList}
          showFlipbook={showFlipbook}
          articles={articles}
          pages={pages}
          zoomLevel={zoomLevel}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          onEditArticle={handleEditArticle}
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          isEditingAllowed={!isShared || allowEdit}
          onDragEnd={handleDragEnd}
          onFlipbookClose={() => setShowFlipbook(false)}
        />

        <button
          onClick={() => {
            setEditingArticle(null);
            setIsModalOpen(true);
          }}
          disabled={isShared && !allowEdit}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 add-article-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <Modal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          setEditingArticle(null);
        }}>
          <ArticleForm 
            onAdd={handleAddArticle} 
            onDelete={handleDeleteArticle}
            article={editingArticle} 
          />
        </Modal>

        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />

        <MagazineSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <DeleteConfirmation
          title={articleToDelete?.title || ''}
          isOpen={!!articleToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setArticleToDelete(null)}
        />

        {collaborationStatus.isCollaborating && (
          <CursorOverlay />
        )}
      </div>
    </div>
  );
}