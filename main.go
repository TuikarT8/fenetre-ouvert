package main

import (
	"fenetre-ouvert/api/rest"
	"fenetre-ouvert/database"
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
	r.HandleFunc("/api/good", rest.PostGoodHandler)
	r.HandleFunc("/api/goods", rest.GetGoodHandler)
	r.HandleFunc("/api/good/{id}/good", rest.DeleteGoodHandler)
	r.HandleFunc("/api/good/{id}", rest.UpdateGoodHandler)

	/*
		Handle Notifications
	*/

	r.HandleFunc("/api/notification", rest.PostNotificationHandler)
	r.HandleFunc("/api/notifications", rest.GetNotificationHandler)
	r.HandleFunc("/api/notification/{id}/notification", rest.DeleteNotificationHandler)
	r.HandleFunc("/api/notification/{id}", rest.UpdateNotificationHandler)

	/*
		Handle Users
	*/

	r.HandleFunc("/api/user", rest.PostUserHandler)
	r.HandleFunc("/api/users", rest.GetUserHandler)
	r.HandleFunc("/api/user/{id}/user", rest.DeleteUserHandler)
	r.HandleFunc("/api/user/{id}", rest.UpdateUserHandler)

	/*
		Handle Sessions
	*/

	r.HandleFunc("/api/session", rest.PostSessionHandler)
	r.HandleFunc("/api/sessions", rest.GetSessionHandler)
	r.HandleFunc("/api/session/{id}/session", rest.DeleteSessionHandler)
	r.HandleFunc("/api/session/{id}", rest.UpdateSessionHandler)

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
