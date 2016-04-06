var assert = require('assert')
    ,fs = require('fs')
    ,mkdirp = require('mkdirp')
    ,warn = console.warn.bind(console)
    ,childProcess = require('child_process')
    ,exec = childProcess.exec
    ,tempRoot = './temp/'
    ,files = [
      ['foo.js','0.1.0']
      ,['bar.txt','0.8.2']
      ,['baz.txt','1.0.1']
    ].map(file=>({
      name: file[0]
      ,path: tempRoot+file[0]
      ,contents: file[1]
    }))
    ,version = require(__dirname+'/../next-version.js')
;

mkdirp(tempRoot,run);

describe('Module', function() {
  beforeEach(setup);
  describe('bump', function () {
    it('should load a file', function(done) {
      read(files[0].path)
          .then(contents=>assert.equal(contents,'0.1.0'))
          .then(done);
    });
    it('should bump to 1.0.2', function(done) {
      version(files.map(file=>file.path),err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.2')),warn)
          .then(done);
      });
    });
  });
  afterEach(teardown);
});

describe('CLI', function() {
  beforeEach(setup);
  describe('bump', function () {
    it('should bump to 1.0.2', function(done) {
      exec('node next-version '+files.  map(file=>file.path).join(' '),err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.2')),warn)
          .then(done);
      });
    });
  });
  afterEach(teardown);
});

function setup(){
	return Promise.all(files.map(file=>save(file.path,file.contents)));
}

function teardown(){
	return Promise.all(files.map(file=>del(file.path)));
}

function save(file,data) {
  return new Promise(function(resolve,reject){
    fs.writeFile(file, data, err=>err&&reject(err)||resolve());
  });
}

function del(file) {
  return new Promise(function(resolve,reject){
    fs.unlink(file, err=>err&&reject(err)||resolve());
  });
}

function read(file) {
  return new Promise(function(resolve,reject){
    fs.readFile(file, (err,data)=>err&&reject(err)||resolve(data.toString()));
  });
}