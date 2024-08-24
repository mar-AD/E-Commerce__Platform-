const fs = require('fs-extra');
const path = require('path');

// Define your services and their destination directories
const services = [
  { name: 'auth', distPath: 'dist/apps/auth' },
  // Add other services here as needed
];

// Base directory for proto files
const protoDir = path.resolve(__dirname, 'proto');
console.log(`Proto directory: ${protoDir}`);

// Define the proto file to copy
const protoFileName = 'auth.proto';

async function copyProtos() {
  try {
    // Ensure the root dist directory exists
    await fs.ensureDir('dist');
    console.log('Ensured root dist directory exists');

    // Ensure each service's dist directory exists
    for (const service of services) {
      const serviceDistDir = path.join(__dirname, service.distPath);
      await fs.ensureDir(serviceDistDir);
      console.log(`Ensured service directory exists: ${serviceDistDir}`);
    }

    // Copy the specific proto file to the corresponding service directory
    await Promise.all(
      services.map(async (service) => {
        const serviceDistDir = path.join(__dirname, service.distPath);
        const srcFile = path.join(protoDir, protoFileName);
        const destFile = path.join(serviceDistDir, protoFileName);

        console.log(`Copying from ${srcFile} to ${destFile}`);
        await fs.copyFile(srcFile, destFile);
        console.log(`Copied ${protoFileName} to ${serviceDistDir}`);
      })
    );
  } catch (err) {
    console.error('Error copying .proto files:', err);
  }
}

copyProtos();
