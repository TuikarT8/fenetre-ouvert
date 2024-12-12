package main

import (
	"fenetre-ouverte/api/rest"
	"fenetre-ouverte/database"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func init() {
	if os.Getenv("MODE") != "PROD" {
		godotenv.Load()
	}
}

func main() {
	r := mux.NewRouter()

	/*
		Handle Goods
	*/
	r.HandleFunc("/api/goods", rest.GoodsHandler)
	r.HandleFunc("/api/goods/{id}", rest.GoodHandler)
	r.HandleFunc("POST /api/goods/{id}/changes", rest.CreateGoodChangeHandler)
	r.HandleFunc("/api/goods/{id}/changes/{sessionId}", rest.HandleGoodChangeOperation)

	/*
		Handle Notifications
	*/
	r.HandleFunc("POST /api/notification", rest.PostNotificationHandler)
	r.HandleFunc("GET /api/notifications", rest.GetNotificationHandler)
	r.HandleFunc("DELETE /api/notifications/{id}", rest.DeleteNotificationHandler)
	r.HandleFunc("PATCH /api/notifications/{id}", rest.UpdateNotificationHandler)

	/*
		Handle Users
	*/
	r.HandleFunc("POST /api/users", rest.HandleCreateUser)
	r.HandleFunc("GET /api/users", rest.HandleGetUsers)
	r.HandleFunc("DELETE /api/users/{id}", rest.HandleDeleteUser)
	r.HandleFunc("PATCH /api/users/{id}", rest.HandleUpdateUser)

	/*
		Handle Sessions
	*/
	r.HandleFunc("/api/sessions", rest.SessionsHandler)
	r.HandleFunc("/api/sessions/{id}", rest.DeleteSessionHandler)
	r.HandleFunc("PATCH /api/sessions/{id}", rest.UpdateSessionHandler)
	r.HandleFunc("POST /api/sessions/{id}/activate", rest.HandleActivateSession)
	r.HandleFunc("GET /api/sessions/{id}/goods", rest.GetSessionGoodsHandler)
	r.HandleFunc("POST /api/sessions/{id}/close", rest.CloseSessionHandler)
	r.HandleFunc("/api/hasActiveSession", rest.HasActiveSessionHandler)

	database.ConnectTodataBase()

	port := getListeningPort()
	log.Printf("Server is Listening on port %s", os.Getenv("PORT"))
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), r))
}

func getListeningPort() string {
	const defaultPort = "3100"

	port := os.Getenv("PORT")

	if port == "" {
		return defaultPort
	}

	return port
}
