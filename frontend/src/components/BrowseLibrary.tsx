import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import BookCard from './BookCard';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  pages: number;
  genre: string;
  status: string;
}

const BrowseLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Menggunakan useSearchParams agar state tersimpan di URL (Bonus: Preserve state)
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const genreFilter = searchParams.get('genre') || '';

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce untuk search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      
      // Update URL param setelah debounce
      const newParams = new URLSearchParams(searchParams);
      if (searchQuery) newParams.set('search', searchQuery);
      else newParams.delete('search');
      setSearchParams(newParams, { replace: true });
      
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Fungsi untuk update genre filter di URL
  const handleGenreChange = (genre: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (genre) newParams.set('genre', genre);
    else newParams.delete('genre');
    setSearchParams(newParams);
  };

  // Fetch data dari API
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError('');
      try {
        let url = 'http://localhost:5001/api/books?';
        if (debouncedSearch) url += `search=${debouncedSearch}&`;
        if (genreFilter) url += `genre=${genreFilter}`;

        const response = await axios.get(url);
        setBooks(response.data);
      } catch (err) {
        setError('Gagal memuat data. Pastikan backend berjalan di port 5001.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedSearch, genreFilter]);

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
          onChange={(e) => {
            // Update URL secara langsung saat mengetik (tanpa debounce untuk UI text)
            const newParams = new URLSearchParams(searchParams);
            if (e.target.value) newParams.set('search', e.target.value);
            else newParams.delete('search');
            setSearchParams(newParams, { replace: true });
          }}
        />
      </div>

      {/* Filter Genre (Wajib) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['', 'Classic', 'Fiction', 'Dystopian', 'Romance', 'Coming-of-age', 'Fantasy', 'Sci-Fi'].map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              genreFilter === genre ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {genre === '' ? 'All Genres' : genre}
          </button>
        ))}
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
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500">No results found.</p>
          <p className="text-gray-400 text-sm mt-1">Coba kata kunci atau genre lain.</p>
        </div>
      ) : (
        <>
          {/* BONUS: Indikator Jumlah Hasil Pencarian */}
          <p className="text-sm text-gray-500 font-medium mb-2">
            Menampilkan {books.length} buku {genreFilter && `untuk genre "${genreFilter}"`}
            {searchQuery && ` dengan kata kunci "${searchQuery}"`}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {books.map((book) => (
              // Bungkus dengan Link ke halaman detail (Wajib)
              <Link to={`/books/${book.id}`} key={book.id} className="block">
                <BookCard book={book as any} variant="library" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseLibrary;