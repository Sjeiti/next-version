# next-version
Change version numbers in multiple files using semver.

Checks the highest version number in the specified files and changes all to the highest number.
It can bump major, minor or patch following semver.
It can append a release and/or build suffix.
Build number can also be extracted from the number of Git commits.

It can even bump itself!

## Javascript

```Javascript
var version = require('next-version');
version(files,options,callback);
```

### Options

#### options.major
Type: `Boolean|Number`
Default value: `false`

#### options.minor
Type: `Boolean|Number`
Default value: `false`

#### options.patch
Type: `Boolean|Number`
Default value: `true`

#### options.version
Type: `String`

#### options.git
Type: `Boolean`
Default value: `false`
Appends a build number based on the number of GIT commits, ie: v1.2.3+897.

#### options.regex
Type: `Regexp|Regexp[]`
Default value: `/\d+\.\d+\.\d+/`

### examples

```Javascript
var version = require('next-version');
version(['foo.txt','bar.txt'],{minor:true},console.log.bind(console,'done');
```

## CLI

Usage: `next-version [options] <files ...>`

Options:

-h, --help               output usage information  
-m, --major [major]      Bump or set major version  
-i, --minor [minor]      Bump or set minor version  
-p, --patch [patch]      Bump or set patch version  
-v, --version [version]  Set the full version number  
-b, --build [build]      The build number  
-g, --git                Git revision number as build number  
-r, --regex [regex]      Regex to find version number with

### examples

`next-version --major=3 foo.js bar.js`

`next-version --minor=3 foo.js bar.js`

`next-version --patch=3 foo.js bar.js`

`next-version --vs="2.3.4" foo.js bar.js`
