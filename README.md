# tag-with-date
Github Action to push customisable tag with timestamp


## Inputs

### `tag-value`

**Required** Base tag value, defaults to `"v"`.

### `revision-number`

**Required** Revision number to differentiate between multiple deployments within same date, defaults to `"v"`.

## Outputs

### `final-tag-value`

Final value of the tag pushed.

## Example usage

uses: halyna/tag-with-date@v1
with:
  tag-value: 'project/app/environment'
  revision-number: '1'
