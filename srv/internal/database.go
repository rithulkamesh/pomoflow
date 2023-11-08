package internal

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var Db *sqlx.DB

func InitDb() error {
	var err error

	Db, err = sqlx.Open("postgres", Config.DatabaseURL)

	if err != nil {
		return err
	}

	if err = Db.Ping(); err != nil {
		return fmt.Errorf("Database ping failed: %w", err)
	}

	createDefaultTables()
	return nil
}

func createDefaultTables() error {
	userTableQuery := `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    `

	err := Db.MustExec(userTableQuery)

	if err != nil {
		return fmt.Errorf("Failed to create default tables: %w", err)
	}

	return nil
}
