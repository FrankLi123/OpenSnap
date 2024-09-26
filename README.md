# OpenSnap Full-Stack Project

This project combines the OpenSnap browser extension (frontend) with the sAveIt backend to create a comprehensive web browsing enhancement solution.

## Project Structure

The repository is organized into two main directories:

- `frontend/`: Contains the OpenSnap browser extension
- `backend/`: Contains the sAveIt backend service

## Frontend: OpenSnap Browser Extension

OpenSnap is a browser extension designed to enhance your web browsing experience.

### Building and Deploying the Extension

We provide a `build_and_copy.sh` script in the `frontend/` directory to automate the build and deployment process for the extension. Follow these steps:

1. Navigate to the `frontend/` directory.
2. Ensure you have all necessary dependencies installed.
3. Run the following command:
./build_and_copy.sh
Copy4. After the build, the `opensnap` directory will contain the extension files ready to be loaded into your browser.

### Loading the Extension

To load the extension into your browser:

1. Open your browser's extension management page.
2. Enable "Developer mode".
3. Click "Load unpacked" (or similar option).
4. Select the `frontend/opensnap` directory from your project.

The OpenSnap extension should now be loaded and active in your browser.

### Frontend Configuration

The frontend project uses `wxt.config.ts` for configuration. Refer to this file in the `frontend/` directory to adjust build settings, entry points, and other project-specific configurations.

## Backend: sAveIt

### Setup

1. Navigate to `backend/` directory.
2. Install dependencies:
`poetry install`
3. Configure:
- Create `.env` file if needed.
- Add necessary environment variables.

4. Start server:
python main.py

## Development Notes

- Ensure all dependencies are installed before running build scripts.
- If you encounter permission issues with scripts, you may need to add execute permissions: `chmod +x script_name.sh`
- The frontend script assumes you're using `pnpm` as your package manager. Modify the script if you're using a different tool.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues if you encounter any problems or have suggestions for improvements.

## Thanks

- [bypass-paywalls](https://github.com/bpc-clone/bypass-paywalls-chrome-clean)
- [create-wxt](https://github.com/wxt-dev/create-wxt)

## License

This project is [MIT-licensed].
