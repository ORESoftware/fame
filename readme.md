
## 🎟 Fame - a tool for displaying git log information by author

```diff
- Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame
```

This command line tool is similar to `git fame`, but this is <i>much</i> faster.
People were complaining that the ruby/python tools were too slow, so I wrote this.

## <i>Installation</i>

```bash
$ npm install -g fame
```


## <i>Usage</i>

By default, a table is printed to the console. If you want JSON output, use the --json flag.

```bash
fame --json
```

### Info for all commits by "alex" on master 
```bash
fame --author=alex
```

### Info for all commits on dev branch by a particular author
```bash
fame --branch=dev --author=alex
```

### Info for all commits for multiple authors

```bash
fame --author=donnie --author=ronnie --author=jonnie
```


### Sorting output

You can sort using the --sort and --order options.

For example:

```bash

fame --sort=1 --order=asc  # will sort by the the 2nd column, ascending
fame --sort=2,3 --order=desc  # will sort by the the 3rd and 4th column, with the 3rd column the priority

```

Or for example, instead of numbers you can also just use the name of the column:

```bash

fame --sort='added lines, files modified' --order=asc

```


### Info for all matching files

```bash
fame --match="\.js"
```

### Info for all files that end with

```bash
fame --extension=".js"
```

#### Command line table output looks like this:

<kbd>
 <image src="https://raw.githubusercontent.com/oresoftware/fame/master/media/fame.png">
</kbd>


#### Command line JSON output looks like this:

<kbd>
 <image src="https://raw.githubusercontent.com/oresoftware/fame/master/media/fame-json.png">
</kbd>
