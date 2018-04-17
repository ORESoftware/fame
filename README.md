

# Fame


## Installation

```bash
npm install fame -g
```

## Usage

By default, a table is printed to the console. If you want JSON output, use the --json flag.

```bash
fame --json
```

### Info for all commits on master 
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



