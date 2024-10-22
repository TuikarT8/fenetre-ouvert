package main

import (
	"fenetre-ouvert/api/rest"
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

	r.HandleFunc("/api/", rest.PostGoodHandler)
	r.HandleFunc("/api/", rest.GetGoodHandler)
	r.HandleFunc("/api/", rest.DeleteGoodHandler)
	r.HandleFunc("/api/", rest.UpdateGoodHandler)

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
