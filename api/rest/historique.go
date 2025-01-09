package rest

import (
	"encoding/json"
	"fenetre-ouverte/api/utils"
	database "fenetre-ouverte/database"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func HandleGetHistorique(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte("HandleGetHistorique()=> Error while gettig params"))
		log.Print("HandleGetHistorique()=> Error while getting params", err)
		return
	}

	Sessions, err := getHistoriqueFromDB(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleGetHistorique()=> Error while gettig good"))
		log.Print("HandleGetHistorique()=> Error while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Sessions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleGetHistorique()=> Error while marsalling good"))
		log.Print("HandleGetHistorique()=> Error while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func getHistoriqueFromDB(pagination PageQueryParams) ([]Event, error) {
	events := make([]Event, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.skip
	opts.Limit = &pagination.count
	result, err := database.Events.Find(database.Ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return events, nil
		}

		return events, err
	}

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &events)
	if err != nil {
		return events, err
	}

	return events, nil
}
