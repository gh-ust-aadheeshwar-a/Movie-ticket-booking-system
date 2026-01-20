import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Pagination for movies
  const [currentMoviePage, setCurrentMoviePage] = useState(1);
  const moviesPerPage = 6;

  // Pagination for bookings with custom items per page
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(5);

  // Login/Register form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Movie form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [movieDuration, setMovieDuration] = useState('');
  const [movieRating, setMovieRating] = useState('');
  const [movieImage, setMovieImage] = useState('');
  const [moviePrice, setMoviePrice] = useState('');

  // Booking form
  const [selectedMovie, setSelectedMovie] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tickets, setTickets] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  useEffect(() => {
    if (user) {
      getMovies();
      getBookings();
    }
  }, [user]);

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

  function getMovies() {
    fetch('http://localhost:8080/api/movies')
      .then(response => response.json())
      .then(data => {
        setMovies(data);
        setCurrentMoviePage(1);
      })
      .catch(error => console.log(error));
  }

  function getBookings() {
    fetch('http://localhost:8080/api/bookings', {
      headers: { 'x-username': user.username }
    })
      .then(response => response.json())
      .then(data => {
        setBookings(data);
        setCurrentBookingPage(1);
      })
      .catch(error => console.log(error));
  }

  function addMovie() {
    if (!movieTitle.trim()) {
      alert('Movie title cannot be empty!');
      return;
    }

    const ratingNum = Number(movieRating);
    if (ratingNum < 1 || ratingNum > 5) {
      alert('Rating must be between 1 and 5!');
      return;
    }

    const priceNum = Number(moviePrice);
    if (!moviePrice || priceNum <= 0) {
      alert('Please enter a valid price!');
      return;
    }

    fetch('http://localhost:8080/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': user.username
      },
      body: JSON.stringify({
        title: movieTitle.trim(),
        genre: movieGenre,
        duration: Number(movieDuration),
        rating: ratingNum,
        image_url: movieImage,
        price: priceNum
      })
    })
      .then(response => {
        if (response.ok) {
          alert('Movie added!');
          setMovieTitle('');
          setMovieGenre('');
          setMovieDuration('');
          setMovieRating('');
          setMovieImage('');
          setMoviePrice('');
          getMovies();
        } else {
          return response.json().then(err => {
            alert(err.detail || 'Failed to add movie');
          });
        }
      })
      .catch(error => alert('Error!'));
  }

  function handlePayment() {
    if (!selectedMovie || !customerName || tickets < 1) {
      alert('Please fill all fields!');
      return;
    }

    const movie = movies.find(m => m.id === Number(selectedMovie));
    if (!movie) {
      alert('Movie not found!');
      return;
    }

    const totalAmount = movie.price * tickets;
    
    if (confirm(`Total Amount: ₹₹{totalAmount}\nProceed with payment?`)) {
      setPaymentStatus('paid');
      alert('Payment Successful!');
    }
  }

  function bookTicket() {
    if (paymentStatus !== 'paid') {
      alert('Please complete payment first!');
      return;
    }

    if (!selectedMovie || !customerName || tickets < 1) {
      alert('Please fill all fields!');
      return;
    }

    const movie = movies.find(m => m.id === Number(selectedMovie));
    const totalAmount = movie.price * tickets;

    fetch('http://localhost:8080/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': user.username
      },
      body: JSON.stringify({
        movie_id: Number(selectedMovie),
        customer_name: customerName,
        tickets: Number(tickets),
        total_amount: totalAmount,
        payment_status: 'paid'
      })
    })
      .then(response => {
        if (response.ok) {
          alert('Booking successful!');
          setSelectedMovie('');
          setCustomerName('');
          setTickets(1);
          setPaymentStatus('unpaid');
          getBookings();
        } else {
          alert('Booking failed!');
        }
      })
      .catch(error => alert('Error!'));
  }

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
          getMovies();
        } else {
          return response.json().then(err => {
            alert(err.detail || 'Failed to delete movie');
          });
        }
      })
      .catch(error => alert('Error deleting movie'));
  }

  function bookThisMovie(movie) {
    setSelectedMovie(movie.id.toString());
    setPaymentStatus('unpaid');
    setPage('book');
  }

  function logout() {
    setUser(null);
    setPage('login');
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 Movie Ticket Booking</h1>
        {user && (
          <div>
            <span>Welcome, {user.username} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>

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

      {user && (
        <div>
          <div className="nav">
            <button
              onClick={() => { setPage('movies'); getMovies(); }}
              className={page === 'movies' ? 'active' : ''}
            >
              Movies
            </button>
            <button
              onClick={() => setPage('book')}
              className={page === 'book' ? 'active' : ''}
            >
              Book Ticket
            </button>
            <button
              onClick={() => { setPage('bookings'); getBookings(); }}
              className={page === 'bookings' ? 'active' : ''}
            >
              My Bookings
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setPage('addMovie')}
                className={page === 'addMovie' ? 'active' : ''}
              >
                Add Movie
              </button>
            )}
          </div>

          {page === 'movies' && (() => {
            const indexOfLast = currentMoviePage * moviesPerPage;
            const indexOfFirst = indexOfLast - moviesPerPage;
            const currentMovies = movies.slice(indexOfFirst, indexOfLast);
            const totalPages = Math.ceil(movies.length / moviesPerPage);

            return (
              <div className="content">
                <h2>Available Movies</h2>
                <div className="movie-grid">
                  {currentMovies.map((movie) => (
                    <div key={movie.id} className="movie-card">
                      {movie.image_url && (
                        <img 
                          src={movie.image_url} 
                          alt={movie.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '5px',
                            marginBottom: '10px'
                          }}
                        />
                      )}
                      <h3>{movie.title}</h3>
                      <p><strong>Genre:</strong> {movie.genre}</p>
                      <p><strong>Duration:</strong> {movie.duration} min</p>
                      <p><strong>Rating:</strong> {movie.rating}/5 ⭐</p>
                      <p><strong>Price:</strong> ₹{movie.price} per ticket</p>
                      
                      <button
                        onClick={() => bookThisMovie(movie)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '10px',
                          fontSize: '16px'
                        }}
                      >
                        Book Tickets
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => deleteMovie(movie.id)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '10px',
                            fontSize: '16px'
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
                    marginTop: '30px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => setCurrentMoviePage(currentMoviePage - 1)}
                      disabled={currentMoviePage === 1}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: currentMoviePage === 1 ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentMoviePage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentMoviePage(pageNum)}
                        style={{
                          padding: '10px 15px',
                          backgroundColor: currentMoviePage === pageNum ? '#007bff' : 'white',
                          color: currentMoviePage === pageNum ? 'white' : '#007bff',
                          border: '2px solid #007bff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: currentMoviePage === pageNum ? 'bold' : 'normal'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentMoviePage(currentMoviePage + 1)}
                      disabled={currentMoviePage === totalPages}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: currentMoviePage === totalPages ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: currentMoviePage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>

                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      Page {currentMoviePage} of {totalPages}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {page === 'book' && (() => {
            const selectedMovieObj = movies.find(m => m.id === Number(selectedMovie));
            const totalAmount = selectedMovieObj ? selectedMovieObj.price * tickets : 0;

            return (
              <div className="content">
                <h2>Book Tickets</h2>
                <select
                  value={selectedMovie}
                  onChange={(e) => {
                    setSelectedMovie(e.target.value);
                    setPaymentStatus('unpaid');
                  }}
                >
                  <option value="">Select a movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} - {movie.genre} ({movie.duration} min) - ₹{movie.price}
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
                  onChange={(e) => {
                    setTickets(e.target.value);
                    setPaymentStatus('unpaid');
                  }}
                  min="1"
                />

                {selectedMovieObj && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    border: '1px solid #007bff'
                  }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                      Payment Summary
                    </p>
                    <p><strong>Movie:</strong> {selectedMovieObj.title}</p>
                    <p><strong>Price per ticket:</strong> ₹{selectedMovieObj.price}</p>
                    <p><strong>Number of tickets:</strong> {tickets}</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff', marginTop: '10px' }}>
                      <strong>Total Amount: ₹{totalAmount}</strong>
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'paid' || !selectedMovie}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: paymentStatus === 'paid' ? '#28a745' : '#ffc107',
                    color: paymentStatus === 'paid' ? 'white' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: paymentStatus === 'paid' || !selectedMovie ? 'not-allowed' : 'pointer',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {paymentStatus === 'paid' ? '✓ Paid' : 'Pay Now'}
                </button>

                <button
                  onClick={bookTicket}
                  disabled={paymentStatus !== 'paid'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: paymentStatus === 'paid' ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: paymentStatus === 'paid' ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Confirm Booking
                </button>

                {paymentStatus !== 'paid' && (
                  <p style={{ textAlign: 'center', color: '#dc3545', marginTop: '10px', fontSize: '14px' }}>
                    ⚠️ Please complete payment before confirming booking
                  </p>
                )}
              </div>
            );
          })()}

          {page === 'bookings' && (() => {
            const activeBookings = bookings.filter(b => b.status === 'Booked');
            const indexOfLast = currentBookingPage * bookingsPerPage;
            const indexOfFirst = indexOfLast - bookingsPerPage;
            const currentBookings = activeBookings.slice(indexOfFirst, indexOfLast);
            const totalPages = Math.ceil(activeBookings.length / bookingsPerPage);

            return (
              <div className="content">
                <h2>My Bookings</h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Show per page:</label>
                  <select
                    value={bookingsPerPage}
                    onChange={(e) => {
                      setBookingsPerPage(Number(e.target.value));
                      setCurrentBookingPage(1);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {activeBookings.length === 0 ? (
                  <p>No active bookings.</p>
                ) : (
                  <>
                    <div>
                      {currentBookings.map((booking) => {
                        const movie = movies.find(m => m.id === booking.movie_id);
                        return (
                          <div key={booking.id} className="booking-card">
                            <h3 style={{ marginBottom: '10px', color: '#007bff' }}>
                              {movie ? movie.title : booking.movie?.title || 'Unknown Movie'}
                            </h3>
                            {movie && (
                              <>
                                <p><strong>Genre:</strong> {movie.genre}</p>
                                <p><strong>Duration:</strong> {movie.duration} min</p>
                                <p><strong>Rating:</strong> {movie.rating}/5 ⭐</p>
                              </>
                            )}
                            <p><strong>Customer:</strong> {booking.customer_name}</p>
                            <p><strong>Tickets:</strong> {booking.tickets}</p>
                            <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
                            <p><strong>Payment Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{booking.payment_status}</span></p>
                            <p><strong>Status:</strong> {booking.status}</p>
                            <p><strong>Booked:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                            <button onClick={() => cancelBooking(booking.id)}>
                              Cancel Booking
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '30px',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => setCurrentBookingPage(currentBookingPage - 1)}
                          disabled={currentBookingPage === 1}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: currentBookingPage === 1 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentBookingPage === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentBookingPage(pageNum)}
                            style={{
                              padding: '10px 15px',
                              backgroundColor: currentBookingPage === pageNum ? '#007bff' : 'white',
                              color: currentBookingPage === pageNum ? 'white' : '#007bff',
                              border: '2px solid #007bff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: currentBookingPage === pageNum ? 'bold' : 'normal'
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentBookingPage(currentBookingPage + 1)}
                          disabled={currentBookingPage === totalPages}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: currentBookingPage === totalPages ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentBookingPage === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Next
                        </button>

                        <span style={{ marginLeft: '10px', color: '#666' }}>
                          Page {currentBookingPage} of {totalPages} ({activeBookings.length} bookings)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {page === 'addMovie' && user.role === 'admin' && (
            <div className="content">
              <h2>Add New Movie</h2>
              <div style={{ color: 'gray', marginBottom: '15px' }}>
                Note: Rating must be between 1 and 5
              </div>
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
                min="1"
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                value={movieRating}
                onChange={(e) => setMovieRating(e.target.value)}
                min="1"
                max="5"
              />
              <input
                type="number"
                placeholder="Price per ticket (₹)"
                value={moviePrice}
                onChange={(e) => setMoviePrice(e.target.value)}
                min="0"
                step="0.01"
              />
              <input
                type="text"
                placeholder="Image URL (e.g., https://example.com/image.jpg)"
                value={movieImage}
                onChange={(e) => setMovieImage(e.target.value)}
              />
              {movieImage && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ marginBottom: '5px' }}>Preview:</p>
                  <img
                    src={movieImage}
                    alt="Preview"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '5px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      alert('Invalid image URL!');
                    }}
                  />
                </div>
              )}
              <button onClick={addMovie}>Add Movie</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;