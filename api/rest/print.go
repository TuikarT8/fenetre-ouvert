package rest

import (
	"fenetre-ouverte/api/tplt"
	"fenetre-ouverte/api/utils"
	"fenetre-ouverte/database"
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
		log.Printf("HandlePrintLabel() => Error while while retreiving good err=[%v]", err)
		tplt.RenderNotFoundPage(w)
		return
	}

	good.StringId = database.BsonToString(goodId)
	err = tplt.RenderTemplate(w, "label", good)
	if err != nil {
		log.Printf("HandleGenerateQrCode() => Error while while rendering template err=[%v]", err)
		tplt.RenderInternalErrorPage(w)
		return
	}
}
