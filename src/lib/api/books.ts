import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';

export async function fetchBookData(query?: string, type: 'search' | 'details' = 'search') {
  try {
    const endpoint = type === 'search'
      ? `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(query || '')}`
      : `${GOOGLE_BOOKS_API}/volumes/${query}`;

    const response = await axios.get(endpoint);
    
    // Format the response data
    if (type === 'search') {
      return {
        items: response.data.items?.map((book: any) => ({
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          publishedDate: book.volumeInfo.publishedDate,
          description: book.volumeInfo.description,
          categories: book.volumeInfo.categories,
          thumbnail: book.volumeInfo.imageLinks?.thumbnail,
          previewLink: book.volumeInfo.previewLink,
          rating: book.volumeInfo.averageRating,
          ratingsCount: book.volumeInfo.ratingsCount
        })) || []
      };
    }

    // Single book details
    const book = response.data;
    return {
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      publisher: book.volumeInfo.publisher,
      publishedDate: book.volumeInfo.publishedDate,
      description: book.volumeInfo.description,
      pageCount: book.volumeInfo.pageCount,
      categories: book.volumeInfo.categories,
      language: book.volumeInfo.language,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      previewLink: book.volumeInfo.previewLink,
      rating: book.volumeInfo.averageRating,
      ratingsCount: book.volumeInfo.ratingsCount,
      isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier
    };

  } catch (error) {
    console.error('Error fetching book data:', error);
    throw error;
  }
}
