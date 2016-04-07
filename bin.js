#!/usr/bin/env node

var version = require("../next-version")
    ,commander = require('commander')
    ,defaultOptions = version.defaultOptions
    ,files
    ,options = {};

commander
  .usage('[options] <files ...>')
  .option('-m, --major [major]', 'Bump or set major version')
  .option('-i, --minor [minor]', 'Bump or set minor version')
  .option('-p, --patch [patch]', 'Bump or set patch version')
  .option('-v, --version [version]', 'Set the full version number')
  .option('-r, --release', 'Release version')
  .option('-b, --build [build]', 'The build number')
  .option('-g, --git', 'Git revision number as build number')
  .option('-x, --regex [regex]', 'Regex to find version number with')
  .parse(process.argv);

files = commander.args;
for (var s in defaultOptions) {
  if (commander.hasOwnProperty(s)) options[s] = commander[s];
}
version(files,options,()=>{});