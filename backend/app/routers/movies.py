from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Movie,Booking
from app.schemas import MovieCreate, MovieUpdate, MovieResponse
from app.routers.auth import require_admin

router = APIRouter()

@router.post("/movies", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie: MovieCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    db_movie = Movie(**movie.dict())
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

@router.get("/movies", response_model=List[MovieResponse])
def get_movies(db: Session = Depends(get_db)):
    return db.query(Movie).all()

@router.get("/movies/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.put("/movies/{movie_id}", response_model=MovieResponse)
def update_movie(
    movie_id: int,
    movie: MovieUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    for key, value in movie.dict().items():
        setattr(db_movie, key, value)
    
    db.commit()
    db.refresh(db_movie)
    return db_movie



@router.delete("/movies/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # This will now delete the movie AND all its bookings
    db.delete(db_movie)
    db.commit()
    return None

# @router.delete("/movies/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_movie(
#     movie_id: int,
#     db: Session = Depends(get_db),
#     _: None = Depends(require_admin)
# ):
#     db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
#     if not db_movie:
#         raise HTTPException(status_code=404, detail="Movie not found")
    
#     # Check if movie has any bookings
#     existing_bookings = db.query(Booking).filter(Booking.movie_id == movie_id).count()
#     if existing_bookings > 0:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Cannot delete movie. It has {existing_bookings} existing booking(s). Please cancel all bookings first."
#         )
    
#     db.delete(db_movie)
#     db.commit()
#     return None