from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.user import User
from ..models.connection import Connection
from ..schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ConnectionResponse])
def read_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connections = db.query(Connection).filter(Connection.user_id == current_user.id).all()
    return connections

@router.post("/", response_model=ConnectionResponse)
def create_connection(
    connection: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_connection = Connection(
        user_id=current_user.id,
        **connection.dict()
    )
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

@router.get("/{connection_id}", response_model=ConnectionResponse)
def read_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    return connection

@router.put("/{connection_id}", response_model=ConnectionResponse)
def update_connection(
    connection_id: int,
    connection_update: ConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    for field, value in connection_update.dict(exclude_unset=True).items():
        setattr(connection, field, value)
    
    db.commit()
    db.refresh(connection)
    return connection

@router.delete("/{connection_id}")
def delete_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    db.delete(connection)
    db.commit()
    return {"message": "Connection deleted successfully"}