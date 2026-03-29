import { Link } from 'react-router-dom';
import { useSavedArticles } from '../hooks/useSavedArticles';

export default function SavedArticles() {
  const { list, remove } = useSavedArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Saved articles</h1>
          <p className="mt-2 text-red-100">Stored in this browser only</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {list.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No saved articles yet. Open a story and use <strong>Save for later</strong> to add it here.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <Link to={`/article/${entry.id}`} className="font-semibold text-gray-900 hover:text-red-600 flex-1">
                  {entry.title}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  className="text-sm text-gray-500 hover:text-red-600 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
