/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/

module.exports = {

  'what-is-your-address': '72 Guild Street\nLondon\nSE23 6FH',

  'delivery-method-labels': {
    'standard': 'Standard delivery (3 working days)',
    'fast-track': 'Fast track delivery (next working day) – £8.50 extra'
  }

}
