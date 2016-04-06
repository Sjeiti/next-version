var assert = require('assert')
    ,fs = require('fs')
    ,mkdirp = require('mkdirp')
    ,warn = console.warn.bind(console)
    ,childProcess = require('child_process')
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

//Promise.all([Promise.resolve(),Promise.resolve()])
//    .then(console.log.bind(console,'oh'));
/*setup()
      .then(read.bind(null,files[0].path))
      .then(console.log.bind(console,'a'),console.warn.bind(console,'b'));*/
/*setup()
  .then(()=>{
    version(files.map(file=>file.path));
  })
  .then(teardown)
  .then(()=>mkdirp(tempRoot,run))
;*/

mkdirp(tempRoot,run);

//for (var s in assert) warn(s);

describe('Array', function() {
  beforeEach(setup);
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
    it('should load a file', function(done) {
      read(tempRoot+'foo.js')
          .then(contents=>assert.equal(contents,'0.1.0'))
          .then(done);
    });
    it('should bump to 1.0.2', function(done) {
      version(files.map(file=>file.path),err=>{
        assert.equal(!!err,false)
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

/*
function runScript(scriptPath) {
	return new Promise(function(resolve,reject){
    var invoked = false
        ,process = childProcess.fork(scriptPath);
    process.on('error',err=>{
        if (invoked) return;
        invoked = true;
        reject(err);
    });
    process.on('exit',code=>{
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        resolve(err);
    });
	});
}*/
