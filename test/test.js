var assert = require('assert')
    ,fs = require('fs')
    ,mkdirp = require('mkdirp')
    ,warn = console.warn.bind(console)
    ,childProcess = require('child_process')
    ,exec = childProcess.exec
    ,tempRoot = './temp/'
    ,cliLocal = 'node bin.js '
    ,files = [
      ['foo.txt','0.1.0']
      ,['bar.txt','0.8.2']
      ,['baz.txt','1.0.1']
    ].map(file=>({
      name: file[0]
      ,path: tempRoot+file[0]
      ,contents: file[1]
    }))
    ,paths = files.map(file=>file.path)
    ,pathsJoined = paths.join(' ')
    ,version = require(__dirname+'/../next-version.js')
;

mkdirp(tempRoot,run);

describe('Module', function() {
  beforeEach(setup);
  describe('bump', function () {
    it('should bump patch', function(done) {
      version(paths,err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.2')),warn)
          .then(done,done);
      });
    });
    it('should bump minor', function(done) {
      version(paths,{minor:true},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.1.0')),warn)
          .then(done,done);
      });
    });
    it('should bump major', function(done) {
      version(paths,{major:true},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'2.0.0')),warn)
          .then(done,done);
      });
    });
  });
  describe('set', function () {
    it('should set patch', function(done) {
      version(paths,{patch:8},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.8')),warn)
          .then(done,done);
      });
    });
    it('should set minor', function(done) {
      version(paths,{minor:3},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.3.1')),warn)
          .then(done,done);
      });
    });
    it('should set major', function(done) {
      version(paths,{major:4},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'4.0.1')),warn)
          .then(done,done);
      });
    });
  });
  describe('build', function () {
    it('should set release suffix', function(done) {
      version(paths,{release:'alpha'},err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.1-alpha')),warn)
          .then(done,done);
      });
    });
  });
  afterEach(teardown);
});

describe('CLI', function() {
  beforeEach(setup);
  describe('bump', function () {
    it('should bump patch', function(done) {
      exec(cliLocal+pathsJoined,err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.2')),warn)
          .then(done,done);
      });
    });
    it('should bump minor', function(done) {
      exec(cliLocal+pathsJoined+' -i',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.1.0')),warn)
          .then(done,done);
      });
    });
    it('should bump major', function(done) {
      exec(cliLocal+pathsJoined+' -m',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'2.0.0')),warn)
          .then(done,done);
      });
    });
  });
  describe('set', function () {
    it('should set patch', function(done) {
      exec(cliLocal+pathsJoined+' --patch=8',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.8')),warn)
          .then(done,done);
      });
    });
    it('should set minor', function(done) {
      exec(cliLocal+pathsJoined+' --minor=3',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.3.1')),warn)
          .then(done,done);
      });
    });
    it('should set major', function(done) {
      exec(cliLocal+pathsJoined+' --major=4',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'4.0.1')),warn)
          .then(done,done);
      });
    });
  });
  describe('build', function () {
    it('should set release suffix', function(done) {
      exec(cliLocal+pathsJoined+' --release=alpha',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.1-alpha')),warn)
          .then(done,done);
      });
    });
    it('should add revision suffix and bump patch', function(done) {
      exec(cliLocal+pathsJoined+' -pg',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal((/1\.0\.2\+\d+/).test(result),true)),warn)
          .then(done,done);
      });
    });
    it('should set build suffix', function(done) {
      exec(cliLocal+pathsJoined+' --build=2345',err=>{
        assert.equal(!!err,false);
        Promise.all(files.map(file=>read(file.path)))
          .then(results=>results.forEach(result=>assert.equal(result,'1.0.1+2345')),warn)
          .then(done,done);
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