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

`- name: Push tag
      uses: halyna/tag-with-date@v2
      with:
        tag-value: 'wh/api/staging'
        revision-number: ${{ github.event.inputs.revision-number }}
        github_token: ${{ secrets.GITHUB_TOKEN }}`
