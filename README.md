

# &#2728; Fame &#2728;

```diff
- Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame Fame
```

This command line tool is similar to `git fame`, but this is <i>much</i> faster.
People were complaining that the ruby/python tools were too slow, so I wrote this.

## <i>Installation</i>

```bash
$ npm install @oresoftware/fame -g
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
