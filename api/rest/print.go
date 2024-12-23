package rest

import (
	"fenetre-ouverte/api/tplt"
	"fenetre-ouverte/api/utils"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func HandlePrintLabel(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}
	goodId := mux.Vars(r)["id"]

	good, err := GetGoodById(goodId)
	if err != nil {
		_ = tplt.RenderTemplate(w, "error", nil)
		w.WriteHeader(http.StatusNotFound)
		log.Printf("HandlePrintLabel() => Errors while while retreiving good err=[%v]", err)
		return
	}
	err = tplt.RenderTemplate(w, "index", good)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("HandlePrintLabel() => Errors while while rendering template err=[%v]", err)
		return
	}
}
