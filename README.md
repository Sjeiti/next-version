# next-version
Change version numbers in multiple files using semver.

## Next version

This module changes version numbers in files, including the option to change the build number to the number of Git commits.
The module can make use of the `git` command and expects it to be globally installed.

```
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


### CLI

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

#### CLI examples

`next-version --major=3 foo.js bar.js`

`next-version --minor=3 foo.js bar.js`

`next-version --patch=3 foo.js bar.js`

`next-version --vs="2.3.4" foo.js bar.js`