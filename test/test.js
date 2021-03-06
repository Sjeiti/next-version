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
      ,['qux.txt','0.7.3-alpha+2349']
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

describe('Module',()=>{
  beforeEach(setup);
  describe('bump',()=>{
    it('should bump patch',done=>version(paths,err=>assertFiles(err,done,'1.0.2')));
    it('should bump minor',done=>version(paths,{minor:true},err=>assertFiles(err,done,'1.1.0')));
    it('should bump major',done=>version(paths,{major:true},err=>assertFiles(err,done,'2.0.0')));
  });
  describe('set',()=>{
    it('should set patch',done=>version(paths,{patch:8},err=>assertFiles(err,done,'1.0.8')));
    it('should set minor',done=>version(paths,{minor:3},err=>assertFiles(err,done,'1.3.1')));
    it('should set major',done=>version(paths,{major:4},err=>assertFiles(err,done,'4.0.1')));
    it('should set version',done=>version(paths,{version:'6.5.4'},err=>assertFiles(err,done,'6.5.4')));
  });
  describe('build',()=>{
    it('should set release suffix',done=>version(paths,{release:'alpha'},err=>assertFiles(err,done,'1.0.1-alpha')));
    it('should add revision suffix and bump patch',done=>version(paths,{git:true,patch:true},err=>assertFilesRegex(err,done,/1\.0\.2\+\d+/)));
    it('should set build suffix',done=>version(paths,{build:2345},err=>assertFiles(err,done,'1.0.1+2345')));
    it('should set release and build',done=>version(paths,{release:'alpha',build:2345},err=>assertFiles(err,done,'1.0.1-alpha+2345')));
  });
  afterEach(teardown);
});

describe('CLI',()=>{
  beforeEach(setup);
  describe('bump',()=>{
    it('should bump patch',done=>exec(cliLocal+pathsJoined,err=>assertFiles(err,done,'1.0.2')));
    it('should bump minor',done=>exec(cliLocal+pathsJoined+' -i',err=>assertFiles(err,done,'1.1.0')));
    it('should bump major',done=>exec(cliLocal+pathsJoined+' -m',err=>assertFiles(err,done,'2.0.0')));
  });
  describe('set',()=>{
    it('should set patch',done=>exec(cliLocal+pathsJoined+' --patch=8',err=>assertFiles(err,done,'1.0.8')));
    it('should set minor',done=>exec(cliLocal+pathsJoined+' --minor=3',err=>assertFiles(err,done,'1.3.1')));
    it('should set major',done=>exec(cliLocal+pathsJoined+' --major=4',err=>assertFiles(err,done,'4.0.1')));
    it('should set version',done=>exec(cliLocal+pathsJoined+' --version=6.5.4',err=>assertFiles(err,done,'6.5.4')));
  });
  describe('build',()=>{
    it('should set release suffix',done=>exec(cliLocal+pathsJoined+' --release=alpha',err=>assertFiles(err,done,'1.0.1-alpha')));
    it('should add revision suffix and bump patch',done=>exec(cliLocal+pathsJoined+' -pg',err=>assertFilesRegex(err,done,/1\.0\.2\+\d+/)));
    it('should set build suffix',done=>exec(cliLocal+pathsJoined+' --build=2345',err=>assertFiles(err,done,'1.0.1+2345')));
    it('should set release and build',done=>exec(cliLocal+pathsJoined+' --release=alpha --build=2345',err=>assertFiles(err,done,'1.0.1-alpha+2345')));
  });
  afterEach(teardown);
});

function setup(){
	return Promise.all(files.map(file=>save(file.path,file.contents)));
}

function teardown(){
	return Promise.all(files.map(file=>del(file.path)));
}

function assertFiles(err,done,version){
  assert.equal(!!err,false);
  Promise.all(files.map(file=>read(file.path)))
    .then(results=>results.forEach(result=>assert.equal(result,version)),warn)
    .then(done,done);
}

function assertFilesRegex(err,done,regex){
  assert.equal(!!err,false);
  Promise.all(files.map(file=>read(file.path)))
    .then(results=>results.forEach(result=>assert.equal(regex.test(result),true)),warn)
    .then(done,done);
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