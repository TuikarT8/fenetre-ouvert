package rest

import (
	"context"
	"encoding/json"
	"fenetre-ouverte/api/tplt"
	"log"
	"net/http"
	"strings"
)

type ContextKey string

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if !strings.Contains(request.URL.Path, "/login") && !strings.Contains(request.URL.Path, "/signup") {
			user, err := verifyJwt(writer, request)
			if err != nil {
				if strings.Contains(request.URL.Path, "/api") {
					jsondata, _ := json.Marshal(map[string]interface{}{
						"error": "You are not authorized to access this resource",
						"code":  "E_ACCESS_DENIED",
					})
					writer.WriteHeader(http.StatusUnauthorized)
					_, _ = writer.Write(jsondata)
					return
				}

				err := tplt.RenderTemplate(writer, "401", nil)
				if err != nil {
					log.Printf("RenderNotFoundPage(): Error while rendering 404 template, err=[%v]", err)
					writer.WriteHeader(http.StatusNotFound)
					writer.Write([]byte("404 Not found"))
					return
				}

			}
			log.Println("Voici l'utilisateur", user)
			newContext := context.WithValue(request.Context(), "user", user)
			enhancedRequest := request.WithContext(newContext)
			next.ServeHTTP(writer, enhancedRequest)
			return
		}

		next.ServeHTTP(writer, request)
	})
}
