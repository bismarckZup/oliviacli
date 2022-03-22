# Olivia CLI

To start Olivia CLI, go the the root of data_manager folder and type
```shell
npm link
```

Then, you will be able to use the commands of `oliviacli`

## Commands

### View and modify partner data
First, insert a dump file in `scripts/oliviacli/partner/dumps`. Then, run the command to load it.
```shell
oliviacli partner load dump-example.txt
```
An interactive shell will be displayed to modify it. Every change will be added to a stage area (`scripts/oliviacli/partner/staging_area`) and will not modify the original dump.

The following options are available:
- **view**: displays all transactions of a customer
- **add**: adds a new transaction to a customer
- **edit**: edits an existing transaction of a customer
- **commit**: creates a new dump file with all the staged changes
# oliviacli
# oliviacli
