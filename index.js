const fs = require('fs/promises');
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const EXIT_CODES = {
  ERROR: 1,
  SUCCESS: 0,
};

const run = async () => {
  const PKG_JSON = {
    name: '',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      dev: 'tsc && node dist/index.js',
    },
    keywords: [],
    author: '',
    license: 'ISC',
  };
  const TS_CONFIG = {
    extends: '@tsconfig/recommended/tsconfig.json',
    compilerOptions: {
      outDir: './dist',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
  // get project name
  const projectName = process.argv.slice(2)[0];
  if (!projectName) {
    console.log('Missing project name');
    return EXIT_CODES.ERROR;
  }

  // edit package.json
  PKG_JSON.name = projectName;

  try {
    // create dir and src dir
    console.log('Creating directories...');
    const BASE_DIR = path.join(os.homedir(), 'Development');
    const newPath = path.join(BASE_DIR, projectName, 'src');
    await fs.mkdir(newPath, { recursive: true });
    const rootPath = newPath.split('/').slice(0, 5).join('/');

    // command
    console.log('Building commands...');
    let command = '';
    // cd, create package.json
    command += `cd ${rootPath} && echo '${JSON.stringify(
      PKG_JSON
    )}' > package.json;`;

    // install typescript deps
    command += 'npm install --save-dev typescript @tsconfig/recommended;';

    // tsconfig
    command += `touch tsconfig.json && echo '${JSON.stringify(
      TS_CONFIG
    )}' > tsconfig.json;`;

    // create index.ts
    command += `cd ${newPath} && touch index.ts;`;

    console.log('Executing commands...');
    execSync(command);
    console.log('Complete! Project directory:', rootPath);
    return EXIT_CODES.SUCCESS;
  } catch (err) {
    console.error(err);
    return EXIT_CODES.ERROR;
  }
};

run();
