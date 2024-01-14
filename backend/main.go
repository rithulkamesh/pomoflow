package main

import (
	"log"
	"math/rand"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		return nil
	})
	registerOtpHandler(app)
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func initUser(app *pocketbase.PocketBase, email string) (*models.Record, error) {

	log.Println("initUser", email)
	existingUser, _ := app.Dao().FindAuthRecordByEmail("users", email)
	if existingUser != nil {
		return existingUser, nil
	}

	userCollection, err := app.Dao().FindCollectionByNameOrId("users")
	if err != nil {
		return nil, err
	}

	newUser := models.NewRecord(userCollection)
	newUser.Set("email", email)
	newUser.Set("verified", false)
	newUser.Set("username", email)

	if err := app.Dao().SaveRecord(newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

func registerOtpHandler(app *pocketbase.PocketBase) {
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.POST("/sendMagicLink", func(c echo.Context) error {
			data := apis.RequestInfo(c).Data
			log.Println("data", data)
			email, ok := data["email"].(string)

			if !ok {
				return apis.NewBadRequestError("Bad Email.", nil)
			}

			user, err := app.Dao().FindAuthRecordByEmail("users", email)

			if err != nil {
				return err
			}

			if user == nil {
				user, err = initUser(app, email)
				if err != nil {
					return err
				}
			}

			return c.JSON(200, user)
		})
		return nil
	})
}

func generateCode() string {
	characters := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	code := make([]byte, 8)
	for i := range code {
		code[i] = characters[rand.Intn(len(characters))]
	}

	code = append(code[:4], append([]byte("-"), code[4:]...)...)
	return string(code)
}
