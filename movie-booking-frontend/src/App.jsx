import { useState } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Movie form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [movieDuration, setMovieDuration] = useState('');
  const [movieRating, setMovieRating] = useState('');

  const [selectedMovie, setSelectedMovie] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tickets, setTickets] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 6;

  function login() {
    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
        setPage('movies');
        getMovies();
        alert('Login successful!');
      })
      .catch(error => alert('Login failed!'));
  }

  // Register function
  function register() {
    fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password, role: role })
    })
      .then(response => {
        if (response.ok) {
          alert('Registration successful! Please login.');
          setPage('login');
        } else {
          alert('Registration failed!');
        }
      })
      .catch(error => alert('Error!'));
  }

  // Get all movies
  function getMovies() {
    fetch('http://localhost:8080/api/movies')
      .then(response => response.json())
      .then(data => {
      setMovies(data);
      setCurrentPage(1);  
    })
      .catch(error => console.log(error));
      
  }

  // Get bookings
  function getBookings() {
    fetch('http://localhost:8080/api/bookings', {
      headers: { 'x-username': user.username }
    })
      .then(response => response.json())
      .then(data => setBookings(data))
      .catch(error => console.log(error));
  }

  // Add movie (admin only)
  function addMovie() {
    fetch('http://localhost:8080/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': user.username
      },
      body: JSON.stringify({
        title: movieTitle,
        genre: movieGenre,
        duration: Number(movieDuration),
        rating: movieRating
      })
    })
      .then(response => {
        if (response.ok) {
          alert('Movie added!');
          setMovieTitle('');
          setMovieGenre('');
          setMovieDuration('');
          setMovieRating('');
          getMovies();
        } else {
          alert('Failed to add movie');
        }
      })
      .catch(error => alert('Error!'));
  }

  // Delete movie (admin only)
function deleteMovie(movieId) {
  if (!confirm('Are you sure you want to delete this movie?')) {
    return;
  }
  
  fetch('http://localhost:8080/api/movies/' + movieId, {
    method: 'DELETE',
    headers: { 'x-username': user.username }
  })
    .then(response => {
      if (response.ok || response.status === 204) {
        alert('Movie deleted successfully!');
        getMovies();  // Refresh the movie list
      } else {
        alert('Failed to delete movie');
      }
    })
    .catch(error => alert('Error deleting movie'));
}

  // Book ticket
  function bookTicket() {
    fetch('http://localhost:8080/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': user.username
      },
      body: JSON.stringify({
        movie_id: Number(selectedMovie),
        customer_name: customerName,
        tickets: Number(tickets)
      })
    })
      .then(response => {
        if (response.ok) {
          alert('Booking successful!');
          setSelectedMovie('');
          setCustomerName('');
          setTickets(1);
        } else {
          alert('Booking failed!');
        }
      })
      .catch(error => alert('Error!'));
  }

  // Cancel booking
  function cancelBooking(bookingId) {
    fetch('http://localhost:8080/api/bookings/' + bookingId + '/cancel', {
      method: 'PATCH',
      headers: { 'x-username': user.username }
    })
      .then(response => {
        if (response.ok) {
          alert('Booking cancelled!');
          getBookings();
        } else {
          alert('Failed to cancel');
        }
      })
      .catch(error => alert('Error!'));
  }

  // Logout
  function logout() {
    setUser(null);
    setPage('login');
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🎬 Movie Ticket Booking</h1>
        {user && (
          <div>
            <span>Welcome, {user.username} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>

      {/* Login Page */}
      {!user && page === 'login' && (
        <div className="form-box">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={login}>Login</button>
          <p className="link" onClick={() => setPage('register')}>
            Don't have an account? Register
          </p>
        </div>
      )}

      {/* Register Page */}
      {!user && page === 'register' && (
        <div className="form-box">
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={register}>Register</button>
          <p className="link" onClick={() => setPage('login')}>
            Already have an account? Login
          </p>
        </div>
      )}

      {/* Navigation for logged in users */}
      {user && (
        <div>
          <div className="nav">
            <button 
            className={page === 'movies' ? 'active':''}
            onClick={() => { setPage('movies'); getMovies(); }}>
              Movies
            </button>
            <button 
            className={page === 'book' ? 'active':''}
            onClick={() => setPage('book')}>Book Ticket</button>
            <button 
            className={page === 'bookings' ? 'active':''}
            onClick={() => { setPage('bookings'); getBookings(); }}>
              My Bookings
            </button>
            {user.role === 'admin' && (
              <button 
              className={page === 'addMovie' ? 'active':''}
              onClick={() => setPage('addMovie')}>Add Movie</button>
            )}
          </div>

          {/* Movies Page
          {page === 'movies' && (
            <div className="content">
              <h2>Available Movies</h2>
              <div className="movie-grid">
                {movies.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <h3>{movie.title}</h3>
                    <p><strong>Genre:</strong> {movie.genre}</p>
                    <p><strong>Duration:</strong> {movie.duration} min</p>
                    <p><strong>Rating:</strong> {movie.rating}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          {/* Movies Page */}
{/* Movies Page */}
{page === 'movies' && (
  <div className="content">
    <h2>Available Movies</h2>
    
    {(() => {
      const indexOfLastMovie = currentPage * moviesPerPage;
      const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
      const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
      const totalPages = Math.ceil(movies.length / moviesPerPage);
      
      return (
        <>
          <div className="movie-grid">
            {currentMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <h3>{movie.title}</h3>
                <p><strong>Genre:</strong> {movie.genre}</p>
                <p><strong>Duration:</strong> {movie.duration} min</p>
                <p><strong>Rating:</strong> {movie.rating}</p>
                
                {user.role === 'admin' && (
                  <button 
                    onClick={() => deleteMovie(movie.id)}
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Delete Movie
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '30px'
            }}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                    color: currentPage === pageNum ? 'white' : '#007bff',
                    border: '2px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                  }}
                >
                  {pageNum}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
              
              {/* Page Info */}
              <span style={{ marginLeft: '10px', color: '#666' }}>
                Page {currentPage} of {totalPages} ({movies.length} movies total)
              </span>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

          {/* Book Ticket Page */}
          {page === 'book' && (
            <div className="content">
              <h2>Book Tickets</h2>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Your Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Number of Tickets"
                value={tickets}
                onChange={(e) => setTickets(e.target.value)}
                min="1"
              />
              <button onClick={bookTicket}>Book Now</button>
            </div>
          )}

          {/* My Bookings Page */}
          {page === 'bookings' && (
            <div className="content">
              <h2>My Bookings</h2>
              {bookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <div className='movie-grid'>
                  {bookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <p><strong>Movie ID:</strong> {booking.movie_id}</p>
                      <p><strong>Movie Title:</strong> {booking.movie.title}</p>

                      <p><strong>Customer:</strong> {booking.customer_name}</p>
                      <p><strong>Tickets:</strong> {booking.tickets}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                      {booking.status === 'Booked' && (
                        <button onClick={() => cancelBooking(booking.id)}>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Movie Page (Admin only) */}
          {page === 'addMovie' && user.role === 'admin' && (
            <div className="content">
              <h2>Add New Movie</h2>
              <input
                type="text"
                placeholder="Movie Title"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Genre"
                value={movieGenre}
                onChange={(e) => setMovieGenre(e.target.value)}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={movieDuration}
                onChange={(e) => setMovieDuration(e.target.value)}
              />
              <input
                type="text"
                placeholder="Rating"
                value={movieRating}
                onChange={(e) => setMovieRating(e.target.value)}
              />
              <button onClick={addMovie}>Add Movie</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;