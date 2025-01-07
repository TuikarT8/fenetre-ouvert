package rest

import (
	"fenetre-ouverte/api/tplt"
	"fenetre-ouverte/api/utils"
	"fmt"
	"image/png"
	"net/http"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
	"github.com/gorilla/mux"
)

func HandleGenerateQrCode(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	goodId := mux.Vars(r)["id"]
	good, err := GetGoodById(goodId)
	if err != nil {
		tplt.RenderNotFoundPage(w)
		return
	}

	qrCode, _ := qr.Encode(fmt.Sprintf("%v", good.ID), qr.L, qr.Auto)
	qrCode, _ = barcode.Scale(qrCode, 256, 256)

	// Generate the qr code and send it over the network
	w.Header().Set("Content-Type", "image/png")
	png.Encode(w, qrCode)
}
