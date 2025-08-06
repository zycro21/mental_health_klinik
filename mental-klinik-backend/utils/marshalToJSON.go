package utils

import (
	"encoding/json"
	"log"

	"gorm.io/datatypes"
)

func MarshalToJSON(v interface{}) datatypes.JSON {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("Gagal marshal JSON: %v", err)
		return datatypes.JSON([]byte("{}")) // fallback
	}
	return datatypes.JSON(data)
}
