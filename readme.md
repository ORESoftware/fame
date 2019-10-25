
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

> For latest version, use: `npm view fame version`

-----

<br>
<br>

<kbd>
 <img src="https://raw.githubusercontent.com/oresoftware/fame/master/media/big.png">
</kbd>


<br>

----

<br>

## <i>Basic Usage</i>

By default, a table is printed to the console. If you want JSON output, use the --json flag.

```bash
fame --json
```

### Info for all commits by "alex"  

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

-----

### More options

<details>
<summary class="text-primary mb-3">Handling multiple email addresses for same person.</summary>

```shell
fame --add-user <display name> -e <email> 
```

now, when fame runs at the command line, it will pick up the info from this file ($HOME/fame.conf.json), 
to combine info from the different emails.

You can add multiple emails like so:

```shell
fame -u <display name> -e <email> -e <email> 
```

</details>

<br>

<details>
<summary class="text-primary mb-3">Sorting with --order and --sort options</summary>

<br>

You can sort using the --sort and --order options.

For example:

```bash

fame --sort=1 --order=asc  # will sort by the the 2nd column, ascending
fame --sort=2,3 --order=desc  # will sort by the the 3rd and 4th column, with the 3rd column the priority

```

Or for example, instead of numbers you can also just use the name (case-insensitive) of the column:

```bash

fame --sort='added lines, files modified' --order=asc

```

Comma-separated list, case-insensitive and whitespace-insensitive

</details>

<br>

<details>
<summary class="text-primary mb-3">Matching on files (ignoring files too)</summary>

<br>
<br>

### Info for all matching files

```bash
fame --match='\.js'
```
-----

<br>

### Info for all files that end with

```bash
fame --extension='.js'  # better to just use the regex option tho
```

----

### Example

To match all .ts files but no .d.ts files, you would do:

```bash
fame --match='\.ts$'  --not-match='\.d\.ts$'

```

Remember these strings are passed to `new RegExp()` so have to escpae the . etc.

</details>


<br>

## Basic command line table output looks like this:

<kbd>
 <image src="https://raw.githubusercontent.com/oresoftware/fame/master/media/fame.png">
</kbd>


## Command line JSON output looks like this:

<kbd>
 <image src="https://raw.githubusercontent.com/oresoftware/fame/master/media/fame-json.png">
</kbd>
