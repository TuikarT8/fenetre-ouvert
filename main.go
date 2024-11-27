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
	r.HandleFunc("/api/goods/{id}/changes", rest.CreateGoodChangeHandler)
	r.HandleFunc("/api/goods/{id}/changes/{sessionId}", rest.HandleGoodChangeOperation)

	/*
		Handle Notifications
	*/
	r.HandleFunc("/api/notification", rest.PostNotificationHandler)
	r.HandleFunc("/api/notifications", rest.GetNotificationHandler)
	r.HandleFunc("/api/notifications/{id}", rest.DeleteNotificationHandler)
	r.HandleFunc("/api/notifications/{id}", rest.UpdateNotificationHandler)

	/*
		Handle Users
	*/
	r.HandleFunc("/api/user", rest.PostUserHandler)
	r.HandleFunc("/api/users", rest.GetUserHandler)
	r.HandleFunc("/api/users/{id}", rest.DeleteUserHandler)
	r.HandleFunc("/api/users/{id}", rest.UpdateUserHandler)

	/*
		Handle Sessions
	*/
	r.HandleFunc("/api/sessions", rest.SessionsHandler)
	r.HandleFunc("/api/sessions/{id}", rest.DeleteSessionHandler)
	r.HandleFunc("/api/sessions/{id}", rest.UpdateSessionHandler)
	r.HandleFunc("/api/sessions/{id}/activate", rest.ActiveSessionHandler)
	r.HandleFunc("/api/sessions/{id}/goods", rest.GetSessionGoodsHandler)

	r.HandleFunc("/api/upload/{id}", rest.UploadHandler)


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
