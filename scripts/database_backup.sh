#!/bin/bash
# Dropout Prediction System - Database Backup Script
# Usage: ./database_backup.sh

BACKUP_DIR="./db_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="dropout_db"
# Fallback to localhost if MONGO_URI is not set
MONGO_URI=${MONGO_URI:-"mongodb://localhost:27017/$DB_NAME"}

mkdir -p "$BACKUP_DIR"

echo "Starting database backup for $DB_NAME..."

# Use mongodump to export the database
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$TIMESTAMP"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully!"
  echo "Backup saved to: $BACKUP_DIR/backup_$TIMESTAMP"
  
  # Compress the backup
  tar -czvf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
  rm -rf "$BACKUP_DIR/backup_$TIMESTAMP"
  
  echo "Backup compressed: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
else
  echo "Backup failed. Please check your MongoDB connection."
fi
