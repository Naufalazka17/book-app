import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import BookCard from './BookCard';

// Sesuaikan Interface dengan data JSON asli
interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  pages: number;
  genre: string;
  status: string; // "read" | "reading" | "want-to-read"
}

const BrowseLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce untuk search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data dari API
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError('');
      try {
        let url = 'http://localhost:5001/api/books?';
        if (debouncedSearch) url += `search=${debouncedSearch}&`;
        if (statusFilter) url += `status=${statusFilter}`;

        const response = await axios.get(url);
        setBooks(response.data);
      } catch (err) {
        setError('Gagal memuat data. Pastikan backend berjalan di port 5001.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by title or author..."
          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Status (Disesuaikan dengan data JSON: "read", "reading", "want-to-read") */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('want-to-read')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'want-to-read' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Want to Read
        </button>
        <button
          onClick={() => setStatusFilter('reading')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'reading' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Reading
        </button>
        <button
          onClick={() => setStatusFilter('read')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Read
        </button>
      </div>

      {/* List Buku */}
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 animate-pulse">Memuat buku...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-xl">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Buku tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book as any} variant="library" />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseLibrary;