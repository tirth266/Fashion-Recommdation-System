"""
Database Configuration
Centralizes MongoDB connection settings.
Uses environment variable MONGO_URI for connection string.
"""
import os
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class DatabaseConfig:
    """MongoDB connection configuration."""

    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/fashiondb")
    DATABASE_NAME = "fashiondb"

    @staticmethod
    def get_database():
        """
        Creates and returns a MongoDB database connection.
        Uses MONGO_URI from environment variables.
        """
        uri = os.environ.get("MONGO_URI", DatabaseConfig.MONGO_URI)
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=10000,
            tlsCAFile=certifi.where(),
            connectTimeoutMS=10000,
            socketTimeoutMS=20000,
        )
        
        # Extract database name from URI, fallback to default
        db_name = DatabaseConfig.DATABASE_NAME
        if "//" in uri:
            after_host = uri.split("//")[-1]
            if "/" in after_host:
                parts = after_host.split("/")
                if len(parts) > 1:
                    raw_name = parts[-1].split("?")[0]
                    if raw_name:
                        db_name = raw_name

        return client[db_name]

    @staticmethod
    def test_connection():
        """
        Tests the MongoDB connection.
        Returns (True, message) on success, (False, error) on failure.
        """
        try:
            uri = os.environ.get("MONGO_URI", DatabaseConfig.MONGO_URI)
            client = MongoClient(
                uri,
                serverSelectionTimeoutMS=10000,
                tlsCAFile=certifi.where(),
                connectTimeoutMS=10000,
                socketTimeoutMS=20000,
            )
            # Force a connection attempt
            client.admin.command("ping")
            
            # Also report how many users exist in the DB
            db_name = DatabaseConfig.DATABASE_NAME
            if "//" in uri:
                after_host = uri.split("//")[-1]
                if "/" in after_host:
                    parts = after_host.split("/")
                    if len(parts) > 1:
                        raw_name = parts[-1].split("?")[0]
                        if raw_name:
                            db_name = raw_name
            
            user_count = client[db_name]["users"].count_documents({})
            return True, f"MongoDB connection successful (DB: {db_name}, Users: {user_count})"
        except ConnectionFailure as e:
            return False, f"MongoDB connection failed: {e}"
        except ServerSelectionTimeoutError as e:
            return False, f"MongoDB server not reachable: {e}"
        except Exception as e:
            return False, f"MongoDB error: {e}"
