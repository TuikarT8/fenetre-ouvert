package rest

import (
	"encoding/json"
	"fenetre-ouverte/database"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetNotificationHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)

	if err != nil {
		w.Write([]byte("GetNotificationHandler ()=> Errors while gettig params"))
		log.Print("GetNotificationHandler ()=> Errors while getting params", err)
		return
	}

	notifications, err := getNotificationInDb(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetNotificationHandler ()=> Errors while gettig "))
		log.Print("GetNotificationHandler ()=> Errors while getting ", err)
		return
	}

	log.Println(notifications)

	jsondata, err := json.Marshal(notifications)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetNotificationHandler ()=> Errors while marsalling notification"))
		log.Print("GetNotificationHandler ()=> Errors while marshalling notification", err)
		return
	}
	w.Write(jsondata)
}

func PostNotificationHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPost) {
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("postNotificationHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print("postNotificationHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var notification Notification

	err = json.Unmarshal(body, &notification)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	_, err = notification.saveNotificationInDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("postNotificationHandler ()=> Errors while creating notification"))
		log.Print("postNotificationHandler ()=> Errors while creating notification", err)
		return
	}

	jsondata, _ := json.Marshal(notification)
	w.Write([]byte(jsondata))
}

func DeleteNotificationHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodDelete) {

	}

	notificationId := mux.Vars(r)["id"]

	err := deleteNotificationInDb(notificationId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("deleteNotificationHandler() => Errors while deleting notification"))
		log.Print("deleteNotificationHandler() => Errors while deleting notification", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateNotificationHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPatch) {
		return
	}

	notificationId := mux.Vars(r)["id"]

	body, err := io.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" UpdateNotificationHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print(" UpdateNotificationHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var notification Notification

	err = json.Unmarshal(body, &notification)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if _, err := notification.UpdateNotificationInDb(notificationId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("UpdatenotificationHandler() => Errors while Updating notification"))
		log.Print("UpdatenotificationHandler() => Errors while Updating notification", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)

}

func (notification *Notification) saveNotificationInDb() (string, error) {
	_, err := database.Notifications.InsertOne(database.Ctx, notification)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}

func getNotificationInDb(pagination PageQueryParams) ([]Notification, error) {
	nts := make([]Notification, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.startAt
	opts.Limit = &pagination.count
	result, err := database.Notifications.Find(database.Ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nts, nil
		}

		return nts, err
	}

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &nts)
	if err != nil {
		return nts, err
	}

	return nts, nil
}

func (notification *Notification) UpdateNotificationInDb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}
	_, err = database.Notifications.UpdateOne(
		ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": notification,
		},
	)
	if err != nil {
		log.Printf("Error while updating notification, error=%v", err)
		return "", err
	}

	return "", err

}

func deleteNotificationInDb(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = database.Notifications.DeleteOne(database.Ctx, bson.M{
		"_id": bsonId,
	})

	if err != nil {
		return err
	}
	return nil
}
