const fs = require('fs');
const colors = require('colors');
const customConfig = require('./projectConfigs/customConfig.json');
const {
  spawn
} = require('child_process');
const { config } = require('process');
const projectName = process.argv[2] || 'Project';

const installTree = () => {
  const brewTree = spawn('brew', ['install', 'tree']);
  brewTree.stdout.on('data', (data) => {
    console.log(`[install tree]: stdout: ${data}`.green);
  });
  brewTree.stderr.on('data', (data) => {
    if (!/already installed/.test(data)) {
      console.error(`[install tree]: stderr: ${data}`.red);
    } else {
      console.log('[install tree]: tree already installed'.red);
    }
  });
  brewTree.on('close', (code) => {
    console.log(`[install tree]: child process exited with code ${code}`.yellow);
  });
}

const logProjectTree = () => {
  const logTree = spawn('tree', [`${projectName}`]);
  logTree.stdout.on('data', (data) => {
    console.log(`[log tree]: directory tree --> ${data}`.green);
  });
  logTree.stderr.on('data', (data) => {
    console.error(`[log tree]: stderr: ${data}`.red);
  });
  logTree.on('close', (code) => {
    console.log(`[log tree]: child process exited with code ${code}`.yellow);
  });
}

const getConfig = (type) => {
  let conf = '';
  switch(type) {
    case 'custom':
      conf = './projectConfigs/customConfig.json';
      break;
    case 'basic':
      conf = './projectConfigs/basicConfig.json';
      break;
  }

  fs.readFile(`${conf}`, 'utf-8', (err, jsonString) => {
    const config = JSON.parse(jsonString);
    buildDirStructure(config, `${projectName}`);
  })
}

const buildDirStructure = (config, path) => {
  config.forEach(dir => {
    if (dir.type === 'directory') {
      try {
        fs.mkdirSync(`${path}/${dir.name}`);
      } catch (err) {
        console.log(`----> [${dir.name}] - ERROR: ${err}`.red);
      }
    } else {
      console.log(`${dir.name} --- IS A --- ${dir.type} --- PATH ${path}`.yellow);
      try {
        fs.writeFileSync(`${path}/${dir.name}.${dir.type}`, `${dir.definition}`);
      } catch (err) {
        console.log(`----> [${dir.name}] - ERROR: ${err}`.red);
      }
    }
    if (dir.content) {
      buildDirStructure(dir.content, `${path}/${dir.name}`);
    }
  })
  logProjectTree()
}

const init = (configType) => {
  try {
    fs.mkdirSync(`${projectName}`);
    installTree();
    getConfig(configType);
  } catch (err) {
    console.log(`SOMETHING WENT WRONG:
     ${err}`);
  }
}

init(process.argv[3]);

/**
 * use like this
 * $ node newBuilder.js ProjectName projectType(basic or custom)
 */