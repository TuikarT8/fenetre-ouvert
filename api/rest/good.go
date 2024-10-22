package rest

import (
	"context"
	"encoding/json"
	database "fenetre-ouvert/database"
	"io/ioutil"
	"log"
	"net/http"
)

var ctx = context.TODO()

func GetGoodHandler(w http.ResponseWriter, r *http.Request) {
	log.Println(" GetGoodHandler() => Ne pas encore implemente")
}

func PostGoodHandler(w http.ResponseWriter, r *http.Request) {
	checkMethod(w, r, http.MethodPost)

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" postGoodHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print(" postGoodHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var good Good

	err = json.Unmarshal(body, &good)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	_, err = good.saveGoodInDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" postGoodHandler ()=> Errors lors de la creation d'une appointment"))
		log.Print(" postGoodHandler ()=> Errors lors de la creation d'une appointment", err)
		return
	}

	jsondata, _ := json.Marshal(good)
	w.WriteHeader(http.StatusNoContent)
	w.Write(jsondata)
}

func DeleteGoodHandler(w http.ResponseWriter, r *http.Request) {
	log.Println(" DeleteGoodHandler()=> Ne pas encore implemente")
}

func UpdateGoodHandler(w http.ResponseWriter, r *http.Request) {
	log.Println(" UpdateGoodHandler()=> Ne pas encore implemente")
}

func checkMethod(w http.ResponseWriter, r *http.Request, method string) {
	if r.Method != method {
		log.Print("Vous tentez d'utiliser un Endpoint avec la methode Inaproprie", r.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("L'endpoint invalid"))
		return
	}
}

func handleUnmarshallingError(err string, w http.ResponseWriter) {
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("Errors lors de l'unmarshalisation du corps de la requette"))
	log.Print("Errors lors de l'unmarshalisation  du corps de la requette", err)
}

func (good *Good) saveGoodInDb() (string, error) {
	_, err := database.Goods.InsertOne(ctx, good)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}
