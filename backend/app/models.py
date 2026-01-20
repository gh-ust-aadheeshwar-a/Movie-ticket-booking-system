# from sqlalchemy import Column, Integer, String, ForeignKey, DateTime,Float
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from app.database import Base

# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, nullable=False, index=True)
#     password = Column(String, nullable=False)
#     role = Column(String, default="customer")
#     created_at = Column(DateTime, default=datetime.utcnow)
    
    
#     bookings = relationship("Booking", back_populates="user")

# class Movie(Base):
#     __tablename__ = "movies"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     genre = Column(String, nullable=False)
#     duration = Column(Integer, nullable=False)
#     rating = Column(String, nullable=False)
#     image_url = Column(String, nullable=True)  # Add this line
#     price = Column(Float, default=0.0)  # Add this line
#     # bookings = relationship("Booking", back_populates="movie")
#     bookings = relationship("Booking", cascade="all, delete-orphan")

# class Booking(Base):
#     __tablename__ = "bookings"
    
#     id = Column(Integer, primary_key=True, index=True)
#     movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     customer_name = Column(String, nullable=False)
#     tickets = Column(Integer, nullable=False)
#     status = Column(String, default="Booked")
#     created_at = Column(DateTime, default=datetime.utcnow)
    
#     movie = relationship("Movie", back_populates="bookings")
#     user = relationship("User", back_populates="bookings")

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    
    bookings = relationship("Booking", back_populates="user")

class Movie(Base):
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    genre = Column(String)
    duration = Column(Integer)
    rating = Column(Integer)
    image_url = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    
    bookings = relationship("Booking", back_populates="movie", cascade="all, delete-orphan")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String)
    tickets = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, default=0.0)
    payment_status = Column(String, default="unpaid")
    
    user = relationship("User", back_populates="bookings")
    movie = relationship("Movie", back_populates="bookings")