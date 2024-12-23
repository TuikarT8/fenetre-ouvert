package utils

import (
	"log"
	"net/http"
)

func AssertMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		ReportWrongHttpMethod(w, r, method)
		return false
	}
	return true
}

func ReportWrongHttpMethod(w http.ResponseWriter, r *http.Request, method string) {
	log.Printf("Vous tentez d'utiliser un endpoint avec une méthode inapropriée %s", r.Method)
	w.WriteHeader(http.StatusMethodNotAllowed)
	w.Write([]byte("L'endpoint invalide"))
}
