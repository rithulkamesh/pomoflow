package internal

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"path/filepath"
)

type AppConfig struct {
	DatabaseURL  string `json:"database_url"`
	Port         int    `json:"port"`
	CookieSecret string `json:"cookie_secret"`
}

var config_file = os.Getenv("HOME") + "/.config/pomosrv/config.json"
var Config AppConfig

func randomString() string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	s := make([]rune, 32)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func LoadConfig() error {
	confile, err := ioutil.ReadFile(config_file)

	if os.IsNotExist(err) {
		file, err := create(config_file)
		defer file.Close()

		if err != nil {
			log.Fatal("Failed to create default config file. Error: ", err)
		}

		file.WriteString(getDefaultConfigJson())

		return fmt.Errorf("Created default config file. Please update the details as necessary.")

	} else if err != nil {
		return err
	}

	if err := json.Unmarshal(confile, &Config); err != nil {
		return err
	}

	return nil
}

// Creates parent directories and the child
func create(path string) (*os.File, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0770); err != nil {
		return nil, err
	}
	return os.Create(path)
}

func getDefaultConfigJson() string {
	conf, _ := json.Marshal(&AppConfig{
		DatabaseURL:  "postgres://user:pass@localhost:5432/c2d?sslmode=disable",
		Port:         4000,
		CookieSecret: base64.StdEncoding.EncodeToString([]byte(randomString())),
	})
	return string(conf)
}
