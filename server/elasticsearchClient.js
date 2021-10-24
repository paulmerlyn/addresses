const elasticsearch = require("elasticsearch")

exports.esClient = new elasticsearch.Client({
    host: "localhost:9200",
}) 