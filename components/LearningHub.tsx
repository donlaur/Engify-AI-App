
import React, { useState, useEffect } from 'react';

// This defines the shape of our article data.
export interface LearningArticle {
    id: string;
    title: string;
    author: string;
    source: string;
    url: string;
    publicationDate: string;
    tags: string[];
    fullText: string;
}

type AnalysisResult = {
  summary: string;
  takeaways: string[];
};

type ActionType = 'generate_playbook' | 'create_plan' | 'draft_share';

const LearningHub: React.FC = () => {
  const [articles, setArticles] = useState<LearningArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
        try {
            const response = await fetch('/data/articles.json');
            if (!response.ok) {
                throw new Error('Failed to fetch articles.');
            }
            const data: LearningArticle[] = await response.json();
            setArticles(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    fetchArticles();
  }, []);


  const handleSelectArticle = (article: LearningArticle) => {
    setSelectedArticle(article);
  };

  const handleAddArticle = (newArticle: Omit<LearningArticle, 'id' | 'tags'>) => {
    const articleToAdd: LearningArticle = {
        ...newArticle,
        id: `user-${Date.now()}`, // Simple unique ID for session
        tags: ['User Submitted'],
    };
    // In a real app, this would be an API call to a database.
    // For now, we prepend to the local state for this session.
    setArticles([articleToAdd, ...articles]);
    setIsModalOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
        return <p>Loading articles...</p>;
    }
    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }
    return (
        <div className="space-y-4">
            {articles.map(article => (
                <div key={article.id} onClick={() => handleSelectArticle(article)} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">{article.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{article.author} / {article.source}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Hub</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              A curated and user-driven knowledge base to keep your team sharp.
            </p>
        </div>
        <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
            Add Article
        </button>
      </header>
      
      <div className="mt-6 flex-1 overflow-y-auto pr-2">
        {renderContent()}
      </div>
      {isModalOpen && <AddArticleModal onClose={() => setIsModalOpen(false)} onAdd={handleAddArticle} />}
    </div>
  );
};


const ArticleDetail: React.FC<{ article: LearningArticle, onBack: () => void }> = ({ article, onBack }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [actionResult, setActionResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const analyzeArticle = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch('/api/process-article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text_content: article.fullText, action: 'analyze' })
                });
                if (!response.ok) throw new Error('Failed to analyze article');
                const data = await response.json();
                setAnalysis(data);
            } catch (err) {
                setError('Could not process article. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        analyzeArticle();
    }, [article]);

    const handleAction = async (action: ActionType) => {
        setIsActionLoading(true);
        setActionResult('');
        try {
            const response = await fetch('/api/process-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text_content: article.fullText, action })
            });
            if (!response.ok) throw new Error(`Failed to perform action: ${action}`);
            const data = await response.json();
            setActionResult(data.result);
        } catch(err) {
             console.error(err);
        } finally {
             setIsActionLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <button onClick={onBack} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-2">&larr; Back to Hub</button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{article.title}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {article.author} / <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{article.source}</a>
                </p>
            </header>
            <div className="mt-6 flex-1 lg:grid lg:grid-cols-2 lg:gap-8 overflow-y-auto pr-2">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-3">AI Analysis</h2>
                    {isLoading && <p>Analyzing...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {analysis && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">Summary</h3>
                                <p className="text-sm mt-1">{analysis.summary}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">Key Takeaways</h3>
                                <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
                                    {analysis.takeaways.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h2 className="text-xl font-semibold mb-3">Workflow Integrator</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">How do you want to apply this knowledge?</p>
                    <div className="space-y-3 mb-4">
                       <ActionButton label="Generate Playbook Recipe" onClick={() => handleAction('generate_playbook')} />
                       <ActionButton label="Create Action Plan" onClick={() => handleAction('create_plan')} />
                       <ActionButton label="Draft Team Share" onClick={() => handleAction('draft_share')} />
                    </div>
                    <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                         {isActionLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Generating...</p></div>}
                         {actionResult ? <pre className="text-sm whitespace-pre-wrap font-sans">{actionResult}</pre> : <p className="text-sm text-slate-500">AI output will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{label: string, onClick: () => void}> = ({ label, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
        {label}
    </button>
);


interface AddArticleModalProps {
    onClose: () => void;
    onAdd: (article: Omit<LearningArticle, 'id' | 'tags'>) => void;
}

const AddArticleModal: React.FC<AddArticleModalProps> = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [source, setSource] = useState('');
    const [url, setUrl] = useState('');
    const [fullText, setFullText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author || !source || !url || !fullText) {
            alert('Please fill out all fields.');
            return;
        }
        onAdd({ title, author, source, url, publicationDate: new Date().toISOString().split('T')[0], fullText });
    };

    return (
         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Add New Article</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" />
                        <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required className="p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" />
                        <input type="text" placeholder="Source (e.g., Blog Name)" value={source} onChange={e => setSource(e.target.value)} required className="p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" />
                        <input type="url" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} required className="p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" />
                    </div>
                    <textarea value={fullText} onChange={e => setFullText(e.target.value)} required rows={10} placeholder="Paste the full text of the article here..." className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-mono text-sm"></textarea>
                    <div className="flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 rounded-lg font-semibold text-sm">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">Add and Analyze</button>
                    </div>
                </form>
            </div>
         </div>
    );
};


export default LearningHub;
