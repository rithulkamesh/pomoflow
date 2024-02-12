package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rithulkamesh/pomoflow/web"
)

func init() {
	godotenv.Load()
}

func main() {
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{"Authorization", "content-type"},
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodPost, http.MethodDelete},
	}))

	e.Use(web.FirestoreMiddleware)
	e.GET("/sessions/:id/checkhealth", checkSessionHealthRoute)

	sessions := e.Group("/sessions")
	sessions.Use(web.AuthMiddleware)

	sessions.POST("/", createSession)
	sessions.POST("/:id/ping", pingSession)
	sessions.DELETE("/:id", deleteSession)
	sessions.POST("/:id/join", joinSession)
	sessions.POST("/:id/leave", leaveSession)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	e.Logger.Fatal(e.Start("0.0.0.0:" + port))
}

type RequestBody struct {
	PomodoroTime   int `json:"pomodoroTime"`
	ShortBreakTime int `json:"shortBreakTime"`
	LongBreakTime  int `json:"longBreakTime"`
}

func checkSessionHealth(fs *firestore.Client, sessionID string) error {
	path := "sessions/" + sessionID + "/guests"
	iter := fs.Collection(path).Documents(context.Background())

	var guests []web.Guest
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var guest web.Guest
		doc.DataTo(&guest)
		guests = append(guests, guest)
	}

	for i, guest := range guests {
		if int(time.Now().Unix())-guest.LastPingTime > 30 {
			_, err := fs.Doc("sessions/" + sessionID + "/guests/" + guest.ID).Delete(context.Background())
			if err != nil {
				return fmt.Errorf("error deleting guest")
			}
			guests = append(guests[:i], guests[i+1:]...)
		}
	}

	if len(guests) == 0 {
		_, err := fs.Doc("sessions/" + sessionID).Delete(context.Background())
		if err != nil {
			return fmt.Errorf("error deleting session")
		}
	} else {
		_, err := fs.Doc("sessions/"+sessionID).Update(context.Background(), []firestore.Update{{Path: "lastHealthCheck", Value: int(time.Now().Unix())}})
		if err != nil {
			return fmt.Errorf("error updating session")
		}
	}

	return nil
}

func checkSessionHealthRoute(c echo.Context) error {
	fs := c.Get("firestore").(*firestore.Client)

	err := checkSessionHealth(fs, c.Param("ID"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error checking session health")
	}

	return c.String(http.StatusOK, "OK")
}

func createSession(c echo.Context) error {
	uid := c.Get("userID").(string)
	var body RequestBody

	if err := c.Bind(&body); err != nil {
		return c.String(http.StatusBadRequest, "Invalid request body")
	}

	if body.PomodoroTime < 1 || body.ShortBreakTime < 1 || body.LongBreakTime < 1 {
		return c.String(http.StatusBadRequest, "Invalid request body")
	}

	fs := c.Get("firestore").(*firestore.Client)
	session := web.Session{
		ID:                uuid.New().String(),
		IsRunning:         false,
		TimerType:         web.Pomodoro,
		HostID:            uid,
		SessionStarted:    false,
		CompletedSessions: 0,
		PomodoroTime:      body.PomodoroTime,
		ShortBreakTime:    body.ShortBreakTime,
		LongBreakTime:     body.LongBreakTime,
		PausedTimes:       []web.Pauses{},
		StartTime:         int(time.Now().Unix()),
		CreatedAt:         int(time.Now().Unix()),
	}
	_, err := fs.Doc("sessions/"+session.ID).Set(context.Background(), session)

	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "Error creating session")
	}

	return c.JSON(http.StatusOK, map[string]string{"id": session.ID})
}

func joinSession(c echo.Context) error {
	var session web.Session
	var user web.Guest
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	doc, err = fs.Doc("users/" + uid).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "User not found")
	}

	doc.DataTo(&user)

	user.LastPingTime = int(time.Now().Unix())
	existingGuest, err := fs.Doc(fmt.Sprintf("sessions/%s/guests/%s", c.Param("id"), uid)).Get(context.Background())

	if uid == session.HostID || (existingGuest != nil && err == nil && existingGuest.Exists()) {
		path := "sessions/" + c.Param("id") + "/guests/" + uid
		_, err = fs.Doc(path).Set(context.Background(), user)

		if err != nil {
			return c.String(http.StatusInternalServerError, "Error updating session")
		}

		return c.String(http.StatusOK, "OK")
	}

	// session.Guests = append(session.Guests, uid)
	// _, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "guests", Value: session.Guests}})

	_, err = fs.Doc(fmt.Sprintf("sessions/%s/guests/%s", c.Param("id"), uid)).Set(context.Background(), web.Guest{ID: uid, LastPingTime: int(time.Now().Unix()), Name: user.Name})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func pingSession(c echo.Context) error {
	userId := c.Get("userID").(string)
	sessionID := c.Param("id")

	fs := c.Get("firestore").(*firestore.Client)
	path := fmt.Sprintf("sessions/%s/guests/%s", sessionID, userId)
	doc, err := fs.Doc(path).Get(context.Background())
	var session web.Session

	if err != nil {
		log.Println(err)
		return c.String(http.StatusNotFound, "Session not found OR user is not part of it.")
	}

	var guest web.Guest
	doc.DataTo(&guest)

	doc, err = fs.Doc("sessions/" + sessionID).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if int(time.Now().Unix())-session.LastHealthCheck > 30 {
		err := checkSessionHealth(fs, sessionID)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error checking session health")
		}
	}

	guest.LastPingTime = int(time.Now().Unix())
	_, err = fs.Doc("sessions/"+c.Param("id")+"/guests/"+userId).Set(context.Background(), guest)

	if err != nil {
		c.Logger().Errorf("Failed to update user, error: %v", err)
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func leaveSession(c echo.Context) error {
	var session web.Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid == session.HostID {
		return c.String(http.StatusTeapot, "Can't really leave if you'e the host, can you?")
	}

	guest, err := fs.Doc("sessions/" + c.Param("id") + "/guests/" + uid).Get(context.Background())

	if err != nil || !guest.Exists() {
		return c.String(http.StatusNotFound, "User not found in session")
	}

	_, err = fs.Doc("sessions/" + c.Param("id") + "/guests/" + uid).Delete(context.Background())

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error deleting user from session.")
	}

	return c.String(http.StatusOK, "Yanked from session.")
}

func deleteSession(c echo.Context) error {
	var session web.Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid != session.HostID {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	_, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "deleted", Value: true}})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error deleting session")
	}

	return c.String(http.StatusOK, "OK")
}
