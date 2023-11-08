package internal

import (
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

func GetUser(email string) (*User, error) {
	user := User{}
	if err := Db.Get(&user, "SELECT * FROM \"users\" where email=$1", email); err != nil {
		return nil, err
	}

	return &user, nil
}

func CreateUser(email string, password string) (string, error) {
	hashpw, err := bcrypt.GenerateFromPassword([]byte(password), 0)

	if err != nil {
		return "", err
	}

	if err != nil {
		return "", err
	}

	user := &User{
		Email:    email,
		Password: string(hashpw),
	}

	if err := user.Save(); err != nil {
		return "", err
	}

	return "ok", nil
}

func DeleteUser(email string) error {
	if _, err := Db.Exec("DELETE FROM \"users\" where email= $1 ", email); err != nil {
		return err
	}

	return nil
}

func (user *User) VerifyPassword(password string) (bool, error) {
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return false, nil
	}

	return true, nil
}

func (user *User) Save() error {
	tx, err := Db.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO users (email, password)
		VALUES ($1, $2)
		ON CONFLICT (email) DO UPDATE
        SET password = EXCLUDED.password
	`, user.Email, user.Password)

	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
