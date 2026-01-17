from pydantic import BaseModel
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "customer"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    
    class Config:
        from_attributes = True

# Movie Schemas
class MovieBase(BaseModel):
    title: str
    genre: str
    duration: int
    rating: str

class MovieCreate(MovieBase):
    pass

class MovieUpdate(MovieBase):
    pass

class MovieResponse(MovieBase):
    id: int
    
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    movie_id: int
    customer_name: str
    tickets: int

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True