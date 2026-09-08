import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app.database.mongodb import db_manager, get_database
from app.main import app


@pytest_asyncio.fixture(scope="function")
async def mock_db():
    """Provides a fresh isolated in-memory mock database for each test."""
    client = AsyncMongoMockClient()
    db = client["test_antigravity_db"]
    # Mock db_manager's db and client
    db_manager.client = client
    db_manager.db = db
    db_manager._is_connected = True
    
    yield db
    
    # Cleanup
    client.close()


@pytest_asyncio.fixture(scope="function")
async def client(mock_db):
    """Provides an async HTTP test client with database dependency override."""
    app.dependency_overrides[get_database] = lambda: mock_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
