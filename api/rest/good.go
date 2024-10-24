package rest

import (
	"context"
	"encoding/json"
	database "fenetre-ouvert/database"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx = context.TODO()

func GetGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)

	if err != nil {
		w.Write([]byte(" GetGoodHandler ()=> Errors while gettig params"))
		log.Print(" GetGoodHandler ()=> Errors while getting params", err)
		return
	}

	goods, err := getGoodInDb(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetGoodHandler ()=> Errors while gettig good"))
		log.Print(" GetGoodHandler ()=> Errors while getting good", err)
		return
	}

	jsondata, err := json.Marshal(goods)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetGoodHandler ()=> Errors while marsalling good"))
		log.Print(" GetGoodHandler ()=> Errors while marshalling good", err)
		return
	}
	w.Write(jsondata)

}

func PostGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPost) {
		return
	}

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
		w.Write([]byte(" postGoodHandler ()=> Errors while creating good"))
		log.Print(" postGoodHandler ()=> Errors while creating good", err)
		return
	}

	jsondata, _ := json.Marshal(good)
	w.Write([]byte(jsondata))
}

func DeleteGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodDelete) {
		return
	}

	goodId := mux.Vars(r)["id"]

	err := deleteGoodInDb(goodId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" DeleteGoodHandler() => Errors while deleting good"))
		log.Print(" DeleteGoodHandler() => Errors while deleting good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPatch) {
		return
	}

	goodId := mux.Vars(r)["id"]

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("  UpdateGoodHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print("  UpdateGoodHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var good Good

	err = json.Unmarshal(body, &good)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if _, err := good.UpdateGoodInDb(goodId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" UpdateGoodHandler() => Errors while Updating good"))
		log.Print(" UpdateGoodHandler() => Errors while Updating good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func handleUnmarshallingError(err string, w http.ResponseWriter) {
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("Errors lors de l'unmarshalisation du corps de la requette"))
	log.Print("Errors lors de l'unmarshalisation  du corps de la requette", err)
}

func deleteGoodInDb(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = database.Goods.DeleteOne(database.Ctx, bson.M{
		"_id": bsonId,
	})

	if err != nil {
		return err
	}
	return nil
}

func getGoodInDb(pagination PageQueryParams) ([]Good, error) {
	apps := make([]Good, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.startAt
	opts.Limit = &pagination.count
	result, err := database.Goods.Find(database.Ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return apps, nil
		}

		return apps, err
	}

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &apps)
	if err != nil {
		return apps, err
	}

	return apps, nil
}

func (good *Good) UpdateGoodInDb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}
	_, err = database.Goods.UpdateOne(
		database.Ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": good,
		},
	)
	if err != nil {
		log.Printf("Error while updating good, error=%v", err)
		return "", err
	}

	return "", err
}

func (good *Good) saveGoodInDb() (string, error) {
	_, err := database.Goods.InsertOne(database.Ctx, good)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}
