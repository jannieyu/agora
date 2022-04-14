package search

import (
	"agora/src/app/database"
	"bufio"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/custom"
	"github.com/blevesearch/bleve/v2/analysis/token/camelcase"
	"github.com/blevesearch/bleve/v2/analysis/token/lowercase"
	"github.com/blevesearch/bleve/v2/analysis/token/snowball"
	"github.com/blevesearch/bleve/v2/analysis/token/stop"
	"github.com/blevesearch/bleve/v2/analysis/tokenizer/unicode"
	"github.com/blevesearch/bleve/v2/analysis/tokenmap"
	"gorm.io/gorm"
	"os"
	"strconv"
)

var indexFilename = "index.bleve"

func loadStopTokens() (map[string]interface{}, error) {
	file, err := os.Open("search/stopwords.txt")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var tokenList []interface{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		tokenList = append(tokenList, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}

	tokenMapConfig := map[string]interface{}{
		"type":   tokenmap.Name,
		"tokens": tokenList,
	}
	return tokenMapConfig, nil
}

func Init(db *gorm.DB) (bleve.Index, error) {

	var index bleve.Index
	index, err := bleve.Open(indexFilename)
	if err == bleve.ErrorIndexPathDoesNotExist {
		indexMapping := bleve.NewIndexMapping()
		tokenConfigMap, err := loadStopTokens()
		if err != nil {
			return nil, err
		}
		err = indexMapping.AddCustomTokenMap("stop_map", tokenConfigMap)
		if err != nil {
			return nil, err
		}

		indexMapping.AddCustomTokenFilter("stop_token_filter",
			map[string]interface{}{
				"type":           stop.Name,
				"stop_token_map": "stop_map",
			})

		indexMapping.AddCustomTokenFilter("snowball_token_filter",
			map[string]interface{}{
				"type":     snowball.Name,
				"language": "english",
			})

		err = indexMapping.AddCustomAnalyzer("customLowercase",
			map[string]interface{}{
				"type":      custom.Name,
				"tokenizer": unicode.Name,
				"token_filters": []string{
					lowercase.Name,
					"stop_token_filter",
					"snowball_token_filter",
				},
			})
		if err != nil {
			panic(err)
		}

		err = indexMapping.AddCustomAnalyzer("customCamelCase",
			map[string]interface{}{
				"type":      custom.Name,
				"tokenizer": unicode.Name,
				"token_filters": []string{
					camelcase.Name,
					"stop_token_filter",
					"snowball_token_filter",
				},
			})
		if err != nil {
			panic(err)
		}

		fieldMapping1 := bleve.NewTextFieldMapping()
		fieldMapping1.Analyzer = "customLowercase"

		fieldMapping2 := bleve.NewTextFieldMapping()
		fieldMapping2.Analyzer = "customCamelCase"

		wordMapping := bleve.NewDocumentMapping()
		wordMapping.AddSubDocumentMapping("id", bleve.NewDocumentDisabledMapping())
		wordMapping.AddSubDocumentMapping("seller_id", bleve.NewDocumentDisabledMapping())
		wordMapping.AddSubDocumentMapping("seller", bleve.NewDocumentDisabledMapping())
		wordMapping.AddSubDocumentMapping("image", bleve.NewDocumentDisabledMapping())
		wordMapping.AddSubDocumentMapping("price", bleve.NewDocumentDisabledMapping())
		wordMapping.AddSubDocumentMapping("created_at", bleve.NewDocumentDisabledMapping())

		wordMapping.AddFieldMappingsAt("name", fieldMapping1, fieldMapping2)
		wordMapping.AddFieldMappingsAt("category", fieldMapping1, fieldMapping2)
		wordMapping.AddFieldMappingsAt("description", fieldMapping1, fieldMapping2)
		wordMapping.AddFieldMappingsAt("condition", fieldMapping1, fieldMapping2)

		indexMapping.DefaultAnalyzer = "customLowercase"
		indexMapping.DefaultMapping = wordMapping

		index, err = bleve.New(indexFilename, indexMapping)
		if err != nil {
			return nil, err
		}

		var items = []database.Item{}
		db.Find(&items)
		for _, item := range items {
			if err := index.Index(strconv.FormatUint(uint64(item.ID), 10), item); err != nil {
				return nil, err
			}
		}
	}
	return index, nil
}
