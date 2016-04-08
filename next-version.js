/**
 * Next version
 * @module next-version
 * @version 0.11.0
 * node task/version major=1 minor
 */
var fs = require('fs')
    ,defaultOptions = {
        major: false
        ,minor: false
        ,patch: false
        ,version: false
        ,release: false
        ,build: false
        ,git: false
        ,gitRevision: false
        ,regex: /\d+\.\d+\.\d+-?[0-9A-Za-z-.]*\+?[0-9A-Za-z-.]*/
    }
;

/**
 *
 * @param {string[]} files
 * @param {object} [options]
 * @param {function} callback
 */
function nextVersion(files,options,callback){
  if (callback===undefined) callback = options;
  options = Object.assign({},defaultOptions,options||{});

  process.argv.slice(2).forEach(s=>{
    var split = s.split('=');
    options[split.shift()] = split.pop()||true;
  });

  // if all options are false simply bump patch
  if (options.major===false&&options.minor===false&&options.patch===false&&options.release===false&&options.build===false&&options.git===false) {
    options.patch = true;
  }

  (options.git&&getGitRevision().then(revision=>(options.gitRevision = revision),console.warn.bind(console))||Promise.resolve())
    .then(iterateFiles.bind(null,files,options))
    .then(()=>callback(),callback);
}

/**
 * Iterate over all specified file groups.
 * @param {Array} files
 * @param {Object} options
 */
function iterateFiles(files,options){
  var versionObject = {major:0,minor:1,patch:2};
  return Promise.all(files.map(src=>read(src)))
    .then(sources=>sources.map((source,i)=>({
      source
      ,src:files[i]
      ,version: getVersionFromSource(source,options)
    })))
    .then(processed=>{
      var versionHighest = getHighestVersion(processed.map(proc=>proc.version))
          ,versionNewSplit = getVersionArray(versionHighest)
          ,versionNew
      ;
      if (options.major===true||options.minor===true||options.patch===true) {
        var start = versionObject[options.major&&'major'||options.minor&&'minor'||options.patch&&'patch']
          ,len = 3-start
        ;
        for (var j=0;j<len;j++) {
          var pos = 3-len+j;
          if (j===0) versionNewSplit[pos]++;
          else       versionNewSplit[pos] = 0;
        }
      } else { // set version
        if (!isBool(options.major)) versionNewSplit[0] = options.major;
        if (!isBool(options.minor)) versionNewSplit[1] = options.minor;
        if (!isBool(options.patch)) versionNewSplit[2] = options.patch;
      }
      versionNew = versionNewSplit.join('.');
      // add release
      if (options.release) {
        versionNew = versionNew+'-'+options.release;
      }
      // add build
      if (options.git||options.build) {
        versionNew = versionNew+'+'+(options.build||options.gitRevision);
      }
      return Promise.all(processed.map(file=>{
        var source = file.source
            ,savePromise;
        if (file.version!==versionNew) {
          if (Array.isArray(options.regex)) {
            options.regex.forEach(regex=>source = replaceSource(source,regex,versionNew));
          } else {
            source = replaceSource(source,options.regex,versionNew);
          }
          savePromise = save(file.src,source);
        }
        return savePromise;
      }).filter(promise=>!!promise));
    })
  ;
}

/**
 * Find the version in a source
 * @param {string} source
 * @param {object} options
 * @returns {string}
 */
function getVersionFromSource(source,options){
  var version;
  if (Array.isArray(options.regex)) {
    var versionMax = 0;
    options.regex.forEach(regex=>{
      var check = getSourceVersion(source,regex)
        ,checkNumber = versionToInt(check);
      if (checkNumber>versionMax) {
        versionMax = checkNumber;
        version = check;
      }
    });
  } else {
    version = getSourceVersion(source,options.regex);
  }
  return version;
}

/**
 * Get the highest from a list of versions
 * @param {string[]} list
 * @returns {boolean|string}
 */
function getHighestVersion(list){
  var highestNumber = -Infinity
    ,highestIndex;
  list
      .map(version=>versionToInt(version))
      .forEach((int,i)=>{
        if (int>highestNumber) {
          highestNumber = int;
          highestIndex = i;
        }
      });
  return highestIndex!==undefined&&list[highestIndex];
}

/**
 * Replace the version in the source
 * @param {string} source
 * @param {RegExp} regex
 * @param {string} version
 * @returns {string}
 */
function replaceSource(source,regex,version){
  var match = source.match(regex);
  if (match) {
    var matchNum = match.length
      ,replace = match.pop();
    if (matchNum===2) {
      var sFull = match.pop();
      source = source.replace(sFull,sFull.replace(replace,version));
    } else {
      source = source.replace(regex,version);
    }
  }
  return source;
}

/**
 * Get the version from the source
 * @param {string} source
 * @param {RegExp} regex
 * @returns {string}
 */
function getSourceVersion(source,regex){
  var match = source.match(regex);
  return match?match.slice(0).pop():'0.0.0';
}

/**
 * Convert a version string to an Array
 * @param {string} version
 * @returns {Array}
 */
function getVersionArray(version){
  return version.split(/[-+]/g).shift().split('.').map(s=>parseInt(s,10));
}

/**
 * Convert a version to an integer
 * @param {string} version
 * @returns {number}
 */
function versionToInt(version){
  var max = 1E6
    ,number = 0;
  getVersionArray(version).forEach(function (n,i) {
    number += n * Math.pow(max,3 - i);
  });
  return number;
}

/**
 * Get the GIT revision number
 * @returns {Promise}
 */
function getGitRevision(){
  return new Promise((resolve,reject)=>{
    require('child_process').exec('git rev-list HEAD --count',(error,stdout)=>{//,stderr
      var match = stdout.match(/\d+/);
      !!match&&resolve(match.pop())||reject('GIT not found');
    });
  });
}

/**
 * Read a file
 * @param {string} file
 * @returns {Promise}
 */
function read(file) {
  return new Promise(function(resolve,reject){
    fs.readFile(file, (err,data)=>err&&reject(err)||resolve(data.toString()));
  });
}

/**
 * Save a file
 * @param {string} file
 * @param {string} data
 * @returns {Promise}
 */
function save(file,data) {
  return new Promise(function(resolve,reject){
    fs.writeFile(file, data, err=>err&&reject(err)||resolve());
  });
}

/**
 * Test if value is a boolean
 * @param {object} o
 * @returns {boolean}
 */
function isBool(o){
  return o===true||o===false;
}

nextVersion.defaultOptions = defaultOptions;
module.exports = nextVersion;