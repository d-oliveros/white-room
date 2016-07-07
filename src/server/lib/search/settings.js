
/**
 * Defines available elasticsearch mappings
 */
export default {
  index: __config.search.index,
  body: {
    analysis: {
      analyzer: {
        edge_ngram_analyzer: {
          tokenizer: 'edge_ngram_tokenizer',
          filter: [
            'lowercase',
            'asciifolding'
          ]
        },

        ngram_analyzer: {
          tokenizer: 'ngram_tokenizer',
          filter: [
            'lowercase',
            'asciifolding'
          ]
        },
        whitespace_analyzer: {
          type: 'custom',
          tokenizer: 'whitespace',
          filter: [
            'lowercase',
            'asciifolding'
          ]
        },
        search_analyzer: {
          type: 'standard',
          tokenizer: 'standard',
          filter: 'stopwords_filter'
        }
      },
      tokenizer: {
        edge_ngram_tokenizer: {
          type: 'edgeNGram',
          min_gram: '3',
          max_gram: '9'
        },

        ngram_tokenizer: {
          type: 'nGram',
          min_gram: '3',
          max_gram: '9'
        }
      },
      filter: {
        stopwords_filter: {
          type: 'stop',
          stopwords: ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'],
          ignore_case: true,
          remove_trailing: true
        },

        ngram_filter: {
          type: 'nGram',
          min_gram: '2',
          max_gram: '30'
        }
      }
    }
  }
};
