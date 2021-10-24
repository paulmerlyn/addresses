'use strict'
const util = require('util')
// const { esClient } = require('../elasticsearchClient')
const { generateId } = require('../utilities/miscutilities')

/* Add one address object to the addresses index */
exports.createAddress = (esClient) => {
  return (req, res) => {
    console.log(`req in createAddress controller is: ${util.inspect(req, { showHidden: false, depth: 4, colors: true })}`)
    esClient.index({
      index: 'addresses',
      id: generateId(req.body),
      body: {
        line1: req.body.line1,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      }
    })
      .then(response => {
        return res.json({ message: 'Indexing of address was successful', response: response })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during address creation: ${err}` })
      })
  }
}

/* Add multiple address (an array of address objects) to the addresses index */
exports.createAddresses = (esClient) => {
  return (req, res) => {
    const multiAddressArr = []

    req.body.forEach(addrObj => {
      multiAddressArr.push({ index: { _index: 'addresses', _type: '_doc', _id: generateId(addrObj) } })
      multiAddressArr.push(addrObj)
    })

    esClient.bulk({
      body: multiAddressArr
    })
      .then(response => {
        return res.json({ message: 'Indexing of addresses was successful', response: response })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during multi-address creation: ${err}` })
      })
  }
}

/* Delete all addresses in the index */
exports.deleteAllAddresses = (esClient) => {
  return (req, res) => {
    // First check to see whether any documents exist
    esClient.count({ index: 'addresses', type: '_doc' })
      .then((response, status) => {
        if (response.count === 0) {
          return res.json({ status: status, message: 'The addresses index is already empty. No addresses to delete.', response: response })
        }

        // At least one document to be deleted. For higher performance, delete then recreate index rather than delete addresses.
        esClient.indices.delete({
          index: 'addresses'
        })
          .then((response, status) => {
            esClient.indices.create({
              index: 'addresses'
            })
              .then((response, status) => {
                return res.json({ status: status, message: 'Deletion of addresses was successful', response: response })
              })
              .catch(err => {
                return res.status(500).json({ message: `Error during index recreation: ${err}` })
              })
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during index deletion: ${err}` })
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during address count prior to deletion of all addresses: ${err}` })
          })
      })
  }
}

/* Delete address by id (query param id) */
exports.deleteAddress = (esClient) => {
  return (req, res) => {
    // First check to see whether referenced document exists and return request error 404 if not found
    esClient.exists({
      index: 'addresses',
      id: req.params.id
    })
      .then(exists => {
        if (!exists) {
          return res.status(404).json({ message: `Unable to delete address. Address not found for id: ${req.params.id}` })
        }
        esClient.delete({
          index: 'addresses',
          id: req.params.id
        })
          .then((response, status) => {
            return res.json({ status: status, message: `Successful deletion of address id ${req.params.id}`, response: response })
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during deletion of address with id: ${req.params.id} count prior to deletion of all addresses: ${err}` })
          })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during check for existence of address id: ${req.params.id}: ${err}` })
      })
  }
}

/* Retrieve all addresses in the index */
exports.getAllAddresses = (esClient) => {
  return (req, res) => {
    // First check to see whether any documents exist
    esClient.count({ index: 'addresses', type: '_doc' })
      .then((response, status) => {
        if (response.count === 0) {
          return res.json({ status: status, message: 'The addresses index is already empty. No addresses to retrieve.', response: response })
        }

        // At least one document to be retrieved.
        esClient.search({
          index: 'addresses',
          body: {
            size: 3,
            from: 1,
            query: {
              match_all: {}
            }
          }
        })
          .then(response => {
            return res.json(response)
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during retrieval of all addresses: ${err}` })
          })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during address count prior to retrieval of all addresses: ${err}` })
      })
  }
}

/* Get all matching addresses for a given ?text=value querystring */
exports.getMatchingAddresses = (esClient) => {
  return (req, res) => {
    const { text: searchText } = req.query
    esClient.search({
      index: 'addresses',
      body: {
        query: {
          multi_match: {
            query: searchText,
            type: 'phrase_prefix',
            fields: ['line1^3', 'city', 'state', 'zip']
          }
        }
      }
    })
      .then(response => {
        return res.json(response)
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during address retrieval: ${err}` })
      })
  }
}

/* Get address for a given id */
exports.getAddress = (esClient) => {
  return (req, res) => {
    // First check to see whether referenced document exists and return request error 404 if not found
    esClient.exists({
      index: 'addresses',
      id: req.params.id
    })
      .then(exists => {
        if (!exists) {
          return res.status(404).json({ message: `Unable to retrieve address. Address not found for id: ${req.params.id}` })
        }

        esClient.get({
          index: 'addresses',
          id: req.params.id
        })
          .then(response => {
            return res.json(response)
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during address retrieval for id: ${req.params.id}: ${err}` })
          })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during check for existence of address id: ${req.params.id}: ${err}` })
      })
  }
}

/* Retrieve the count of records in the addresses index */
exports.getAddressCount = (esClient) => {
  return (req, res, status) => {
    esClient.count({ index: 'addresses', type: '_doc' })
      .then((response, status) => {
        return res.json({ status: status, message: 'Count of addresses was successful', response: response })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during address count: ${err}` })
      })
  }
}

/* Update a single address document by id (query param id) */
exports.updateAddress = (esClient) => {
  return (req, res) => {
    // First check to see whether referenced document exists and return request error 404 if not found
    esClient.exists({
      index: 'addresses',
      id: req.params.id
    })
      .then(exists => {
        if (!exists) {
          return res.status(404).json({ message: `Unable to modify address. Address not found for id: ${req.params.id}` })
        }

        esClient.update({ index: 'addresses', id: req.params.id, body: { doc: req.body } })
          .then((response, status) => {
            return res.json({ status: status, message: `Update of address id: ${req.params.id} was successful`, response: response })
          })
          .catch(err => {
            return res.status(500).json({ message: `Error during update of address id: ${req.params.id}: ${err}` })
          })
      })
      .catch(err => {
        return res.status(500).json({ message: `Error during address update check: ${err}` })
      })
  }
}
