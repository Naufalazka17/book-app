from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get configuration from environment variables
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:8080,http://localhost:5173').split(',')
DATA_FILE = os.getenv('DATA_FILE', 'books.json')
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Set Flask secret key
app.secret_key = SECRET_KEY

# Configure CORS with environment variables
CORS(app, 
     origins=CORS_ORIGINS,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     supports_credentials=True)

# Add a test endpoint to check CORS
@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_cors():
    return jsonify({"message": "CORS is working!"})

# Load books from JSON file
def load_books():
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            return data.get('books', [])
    except FileNotFoundError:
        return []

# Save books to JSON file
def save_books(books_data):
    with open(DATA_FILE, 'w') as f:
        json.dump({'books': books_data}, f, indent=2)

# Initialize books from JSON file
books = load_books()

@app.route('/api/books', methods=['GET', 'OPTIONS'])
def get_books():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    search_query = request.args.get('search', '').strip().lower()
    genre_filter = request.args.get('genre', '').strip().lower()
    
    filtered_books = books.copy()
    
    if search_query:
        filtered_books = [
            book for book in filtered_books 
            if search_query in str(book.get('title', '')).lower() or 
               search_query in str(book.get('author', '')).lower()
        ]
        
    if genre_filter:
        filtered_books = [
            book for book in filtered_books 
            if genre_filter == str(book.get('genre', '')).lower()
        ]
        
    return jsonify(filtered_books)

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.json
    book = {
        'id': len(books) + 1,
        'title': data.get('title'),
        'author': data.get('author'),
        'cover': data.get('cover', ''),
        'rating': data.get('rating', 0),
        'pages': data.get('pages', 0),
        'genre': data.get('genre', ''),
        'status': data.get('status', 'want-to-read')
    }
    books.append(book)
    save_books(books)
    return jsonify(book), 201

# PENGGABUNGAN ROUTE UNTUK SATU BUKU (GET, PUT, DELETE)
@app.route('/api/books/<int:book_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def book_detail(book_id):
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    # Cari buku berdasarkan ID
    book = next((b for b in books if b['id'] == book_id), None)
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    # 1. Handle GET (Untuk Detail Page)
    if request.method == 'GET':
        return jsonify(book)

    # 2. Handle PUT (Untuk Update)
    if request.method == 'PUT':
        data = request.json
        book['title'] = data.get('title', book['title'])
        book['author'] = data.get('author', book['author'])
        book['cover'] = data.get('cover', book['cover'])
        book['rating'] = data.get('rating', book['rating'])
        book['pages'] = data.get('pages', book['pages'])
        book['genre'] = data.get('genre', book['genre'])
        book['status'] = data.get('status', book['status'])
        save_books(books)
        return jsonify(book)

    # 3. Handle DELETE (Untuk Hapus)
    if request.method == 'DELETE':
        books.remove(book)
        save_books(books)
        return jsonify(book)

if __name__ == '__main__':
    print(f"Starting Flask server on http://{FLASK_HOST}:{FLASK_PORT}")
    print("CORS enabled for development")
    print(f"Allowed origins: {CORS_ORIGINS}")
    app.run(debug=FLASK_DEBUG, port=FLASK_PORT, host=FLASK_HOST)