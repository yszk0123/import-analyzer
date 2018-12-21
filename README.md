# Usage

```
$ yarn install
$ yarn generate /path/to/src/dir > output.json
# Print dependents
$ yarn print /path/to/target/file output.json --up 2>/dev/null | sort | uniq > output.txt
# Print dependencies
$ yarn print /path/to/target/file output.json 2>/dev/null | sort | uniq > output.txt
```
