import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, BookOpen } from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5001/api/books/${id}`)
      .then(res => setBook(res.data))
      .catch(() => alert("Buku tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!book) return <div className="p-10 text-center">Buku tidak ada.</div>;

  return (
    <div className="min-h-screen bg-white p-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-gray-600">
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>
      
      <img src={book.cover} alt={book.title} className="w-full h-64 object-cover rounded-xl mb-4" />
      
      <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
      <p className="text-gray-500 mb-2">{book.author}</p>
      
      <div className="flex gap-4 mb-6">
        <span className="flex items-center text-yellow-500"><Star size={16} className="mr-1"/> {book.rating}</span>
        <span className="flex items-center text-gray-500"><BookOpen size={16} className="mr-1"/> {book.pages} pages</span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{book.genre}</span>
      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
        Add to My Library
      </button>
    </div>
  );
};

export default BookDetail;