# from pydantic import BaseModel,Field
# from datetime import datetime

# # User Schemas
# class UserRegister(BaseModel):
#     username: str
#     password: str
#     role: str = "customer"

# class UserLogin(BaseModel):
#     username: str
#     password: str

# class UserResponse(BaseModel):
#     id: int
#     username: str
#     role: str
    
#     class Config:
#         from_attributes = True

# # Movie Schemas
# class MovieBase(BaseModel):
#     title: str
#     genre: str
#     duration: int
#     rating: int = Field(ge=1,le=10)
#     image_url: str = "" 
#     price: float = Field(..., gt=0)

# class MovieCreate(MovieBase):
#     pass

# class MovieUpdate(MovieBase):
#     pass

# class MovieResponse(MovieBase):
#     id: int
    
#     class Config:
#         from_attributes = True

# # Booking Schemas
# class BookingBase(BaseModel):
#     movie_id: int
#     customer_name: str
#     tickets: int
#     total_amount: float = 0.0  # Add this line
#     payment_status: str = "unpaid"  # Add this line

# class BookingCreate(BookingBase):
#     pass

# class BookingResponse(BookingBase):
#     id: int
#     user_id: int
#     status: str
#     created_at: datetime
#     movie: MovieBase
    
#     class Config:
#         from_attributes = True

from pydantic import BaseModel, field_validator, Field
from datetime import datetime

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

class MovieBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    genre: str
    duration: int = Field(..., gt=0)
    rating: int = Field(..., ge=1, le=5)
    image_url: str = ""
    price: float = Field(..., gt=0)
    
    @field_validator('title')
    @classmethod
    def normalize_title(cls, v):
        if not v or v.strip() == '':
            raise ValueError('Title cannot be empty')
        return v.strip().title()
    
    @field_validator('rating')
    @classmethod
    def rating_must_be_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class MovieCreate(MovieBase):
    pass

class MovieUpdate(MovieBase):
    pass

class MovieResponse(MovieBase):
    id: int
    
    class Config:
        from_attributes = True

class MovieInfo(BaseModel):
    title: str
    
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    movie_id: int
    customer_name: str
    tickets: int
    total_amount: float = 0.0
    payment_status: str = "unpaid"

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    movie: MovieInfo
    
    class Config:
        from_attributes = True