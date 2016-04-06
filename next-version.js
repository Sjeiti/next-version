
/**
 * node task/version major=1 minor
 */

var fs = require('fs')
    ,exec = require('child_process').exec
    ,warn = console.warn.bind(console)
    //
    ,versionObject = {major:0,minor:1,patch:2}
    ,defaultOptions = {
        major: false
        ,minor: false
        ,patch: false
        ,version: false
        ,build: 'num'//||hash
        ,git: false
        ,gitRevision: false
        ,regex: /\d+\.\d+\.\d+-?[0-9A-Za-z-.]*\+?[0-9A-Za-z-.]*/
    }
    ,isBump
;

function version(files,options,callback){
  if (callback===undefined) callback = options;
  options = Object.assign({},defaultOptions,options||{});
  //console.log('options',options); // todo: remove log

  process.argv.slice(2).forEach(s=>{
    var split = s.split('=');
    options[split.shift()] = split.pop()||true;
  });

  // if all options are false simply bump patch
  if (options.major===false&&options.minor===false&&options.patch===false) {
    options.patch = true;
  }

  // set bump string
  isBump = options.major===true&&'major'||options.minor===true&&'minor'||options.patch===true&&'patch';

  (options.git&&getGitRevision().then(revision=>(options.gitRevision = revision),warn)||Promise.resolve())
    .then(iterateFiles.bind(null,files,options))
    .then(callback,callback);
}

/**
 * Iterate over all specified file groups.
 * @param {Array} files
 * @param {Object} options
 * @param {string} gitRevision
 * @todo don't use sync and return promise
 */
function iterateFiles(files,options,gitRevision){
  var highestVersion = '0.0.0'
      ,highestVersionNumeral = 0
      ,processedFiles = []
      /*,msgs = []*/;
  files.forEach(src=>{
    var source = fs.readFileSync(src).toString()
        ,version
        ,versionNewList
        ,versionNew
        ,isRegexArray = Array.isArray(options.regex)
        ,versionNumber
    ;
    if (isRegexArray) {
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
    versionNewList = getVersionArray(version);
    //
    // bump version
    if (isBump) {
      var start = versionObject[isBump]
        ,len = 3-start
      ;
      for (var j=0;j<len;j++) {
        var pos = 3-len+j;
        if (j===0) versionNewList[pos]++;
        else       versionNewList[pos] = 0;
      }
    } else { // set version
      if (!isBool(options.major)) versionNewList[0] = options.major;
      if (!isBool(options.minor)) versionNewList[1] = options.minor;
      if (!isBool(options.patch)) versionNewList[2] = options.patch;
    }
    versionNew = versionNewList.join('.');
    versionNumber = versionToInt(versionNew);
    if (versionNumber>highestVersionNumeral) {
        highestVersionNumeral = versionNumber;
        highestVersion = versionNew;
    }
    processedFiles.push({
        version: version
        ,source: source
        ,src: src
    });
  });
  processedFiles.forEach(o=>{
    var src = o.src
      ,source = o.source
      ,version = o.version
      ,versionNew = highestVersion
      ,isRegexArray = Array.isArray(options.regex)
    ;
    // add release
    /*if (isParamRelease) {
      versionNew = versionNew+'-'+paramRelease;
    }*/
    // add build
    if (options.git) {
      versionNew = versionNew+'+'+gitRevision;
    }
    // save file
    if (versionNew!==version) {
      if (isRegexArray) {
        options.regex.forEach(function(regex){
          source = replaceSource(source,regex,versionNew);
        });
      } else {
        source = replaceSource(source,options.regex,versionNew);
      }
      fs.writeFileSync(src,source);
      //console.log('File \''+src+'\' updated from',version,'to',versionNew);
    //} else {
      //console.log('File \''+src+'\' is up to date',version);
    }
  });
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

function getGitRevision(){
  return new Promise((resolve,reject)=>{
    exec('git rev-list HEAD --count',(error,stdout)=>{//,stderr
      var match = stdout.match(/\d+/);
      !!match&&resolve(match.pop())||reject('GIT not found');
    });
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

version.defaultOptions = defaultOptions;
module.exports = version;