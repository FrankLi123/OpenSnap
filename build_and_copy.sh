#!/bin/bash
# Run pnpm build
echo "Running pnpm init"
pnpm i

# Run pnpm build
echo "Running pnpm build..."
pnpm build

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Define source and destination directories
SOURCE_DIR=".output/chrome-mv3"
DEST_DIR="saveit"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy files and folders, replacing existing ones
echo "Copying files and folders..."
cp -R "$SOURCE_DIR/assets" "$DEST_DIR/"
cp -R "$SOURCE_DIR/chunks" "$DEST_DIR/"
cp "$SOURCE_DIR/popup.html" "$DEST_DIR/"

echo "Build and copy process completed successfully."