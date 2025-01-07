package rest

import (
	"context"
	"encoding/json"
	"fenetre-ouverte/api/tplt"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

type ContextKey string

var permissions map[string]interface{}

func Init() {
	bytesRead := make([]byte, 0)
	jsonfile, err := os.Open("permission.json")
	if err != nil {
		log.Println("Erreur survenu lors de la lecture du fichier json", err)
	}
	defer jsonfile.Close()

	bytesRead, _ = ioutil.ReadAll(jsonfile)

	json.Unmarshal(bytesRead, &permissions)
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if !strings.Contains(request.URL.Path, "/login") && !strings.Contains(request.URL.Path, "/signup") {
			user, err := authenticateRequest(writer, request)
			if err != nil {
				return
			}

			if !authorizeRequest(user, writer, request) {
				return
			}

			newContext := context.WithValue(request.Context(), "user", user)
			enhancedRequest := request.WithContext(newContext)
			next.ServeHTTP(writer, enhancedRequest)
			return
		}

		next.ServeHTTP(writer, request)
	})
}

func authenticateRequest(w http.ResponseWriter, r *http.Request) (User, error) {
	user, err := verifyJwt(w, r)
	if err != nil {
		if strings.Contains(r.URL.Path, "/api") {
			jsondata, _ := json.Marshal(map[string]interface{}{
				"error": "You are not authorized to access this resource",
				"code":  "E_ACCESS_DENIED",
			})
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write(jsondata)
			return user, fmt.Errorf("Autentication failed")
		}

		err := tplt.RenderTemplate(w, "401", nil)
		if err != nil {
			log.Printf("RenderNotFoundPage(): Error while rendering 404 template, err=[%v]", err)
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("404 Not found"))
			return user, fmt.Errorf("Cannot render authentication error page")
		}

		return user, fmt.Errorf("Autentication failed")
	}

	return user, nil
}

func authorizeRequest(user User, w http.ResponseWriter, r *http.Request) bool {
	entity := getEntityFromRequest(r)
	operation := getOperationFromRequest(r)
	if entity == Entities_Unknown {
		return false
	}

	return user.HasPermission(fmt.Sprintf("%s_%s", strings.ToUpper(entity), operation))
}

func getEntityFromRequest(r *http.Request) string {
	if strings.Contains(r.URL.Path, "/users") {
		return Entities_User
	} else if strings.Contains(r.URL.Path, "/groups") {
		return Entities_Group
	} else if strings.Contains(r.URL.Path, "/goods") {
		return Entities_Good
	} else if strings.Contains(r.URL.Path, "/sessions") {
		return Entities_Session
	}

	return Entities_Unknown
}

func getOperationFromRequest(r *http.Request) string {
	switch r.Method {
	case http.MethodPatch:
		return EntityOperation_Update
	case http.MethodPost:
	case http.MethodDelete:
		return EntityOperation_Write
	case http.MethodGet:
		return EntityOperation_Read
	default:
		return EntityOperation_Unknown
	}

	return EntityOperation_Unknown
}
