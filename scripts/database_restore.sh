#!/bin/bash
# Dropout Prediction System - Database Restore Script
# Usage: ./database_restore.sh <path_to_backup.tar.gz>

if [ -z "$1" ]; then
  echo "Error: Please provide the path to the backup archive."
  echo "Usage: ./database_restore.sh <path_to_backup.tar.gz>"
  exit 1
fi

BACKUP_ARCHIVE="$1"
DB_NAME="dropout_db"
MONGO_URI=${MONGO_URI:-"mongodb://localhost:27017/$DB_NAME"}
EXTRACT_DIR="/tmp/dropout_db_restore"

if [ ! -f "$BACKUP_ARCHIVE" ]; then
  echo "Error: File $BACKUP_ARCHIVE not found."
  exit 1
fi

echo "Starting database restore process..."
mkdir -p "$EXTRACT_DIR"

# Extract archive
echo "Extracting backup..."
tar -xzvf "$BACKUP_ARCHIVE" -C "$EXTRACT_DIR"

# Get the name of the extracted folder
EXTRACTED_FOLDER=$(ls -1 "$EXTRACT_DIR" | head -n 1)

echo "Restoring database to $MONGO_URI..."
mongorestore --uri="$MONGO_URI" --drop "$EXTRACT_DIR/$EXTRACTED_FOLDER/$DB_NAME"

if [ $? -eq 0 ]; then
  echo "Database restored successfully!"
else
  echo "Restore failed."
fi

# Cleanup
rm -rf "$EXTRACT_DIR"
echo "Cleanup completed."
