# OpenSnap Browser Extension

OpenSnap is a browser extension designed to enhance your web browsing experience. This README will guide you through the process of building and deploying the extension.

## Building and Deploying

We provide a `build_and_copy.sh` script to automate the build and deployment process. Follow these steps:

1. Ensure you have all necessary dependencies installed.

2. Run the following command in the project root directory:

   ```
   ./build_and_copy.sh
   ```

4. After the build, the `opensnap` directory will contain the extension files ready to be loaded into your browser.

## Loading the Extension

To load the extension into your browser:

1. Open your browser's extension management page.
2. Enable "Developer mode".
3. Click "Load unpacked" (or similar option).
4. Select the `open` directory from your project.

The OpenSnap extension should now be loaded and active in your browser.

## Configuration

The project uses `wxt.config.ts` for configuration. Refer to this file to adjust build settings, entry points, and other project-specific configurations.

## Notes

- Ensure all dependencies are installed before running the build script.
- If you encounter permission issues, you may need to add execute permissions to the script: `chmod +x build_and_copy.sh`
- The script assumes you're using `pnpm` as your package manager. Modify the script if you're using a different tool.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues if you encounter any problems or have suggestions for improvements.

## Thanks

- [bypass-paywalls](https://github.com/bpc-clone/bypass-paywalls-chrome-clean)
- [create-wxt](https://github.com/wxt-dev/create-wxt)

## License

[MIT-licensed]
