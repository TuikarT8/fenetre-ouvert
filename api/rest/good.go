package rest

import (
	"context"
	"encoding/json"
	"fenetre-ouverte/api/utils"
	database "fenetre-ouverte/database"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx = context.TODO()

func GoodsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		GetGoodHandler(w, r)
	} else if r.Method == http.MethodPost {
		CreateGoodHandler(w, r)
	} else {
		utils.ReportWrongHttpMethod(w, r, r.Method)
	}
}

func GoodHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {
		DeleteGoodHandler(w, r)
	} else if r.Method == http.MethodPatch {
		UpdateGoodHandler(w, r)
	} else if r.Method == http.MethodGet {
		GetOneGoodHandler(w, r)
	} else {
		utils.ReportWrongHttpMethod(w, r, r.Method)
	}
}

func GetOneGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	goodId := mux.Vars(r)["id"]

	good, err := getOneGood(goodId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetOneGoodHandler () => Error while gettig good"))
		log.Print("GetOneGoodHandler () => Error while getting good", err)
		return
	}

	jsondata, err := json.Marshal(good)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetOneGoodHandler () => Error while marsalling good"))
		log.Print("GetOneGoodHandler () => Error while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func GetGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)

	if err != nil {
		w.Write([]byte("GetGoodHandler () => Error while gettig params"))
		log.Print("GetGoodHandler () => Error while getting params", err)
		return
	}

	goods, err := getGoods(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetGoodHandler () => Error while gettig good"))
		log.Print("GetGoodHandler () => Error while getting good", err)
		return
	}

	jsondata, err := json.Marshal(goods)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetGoodHandler () => Error while marsalling good"))
		log.Print("GetGoodHandler () => Error while marshalling good", err)
		return
	}
	w.Write(jsondata)

}

func CreateGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	createMode := r.Header.Get("Create-Mode")
	if createMode == "many" {
		handleCreateManyGoods(w, r)
	} else {
		handleCreateOneGood(w, r)
	}
}

func handleCreateManyGoods(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("handleCreateOneGood() => Errors lors de la lecture du corps de la requette"))
		log.Print("handleCreateOneGood() => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var goods []FormularyGood

	err = json.Unmarshal(body, &goods)
	if err != nil {
		log.Printf("handleCreateManyGoods() Error while unmarshalling payload for creating many goods, err=[%v]", err)
		handleUnmarshallingError(err.Error(), w)
		return
	}

	goods, err = createManyGoods(goods)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("handleCreateOneGood () => Error while creating good"))
		log.Print("handleCreateOneGood () => Error while creating good", err)
		return
	}

	goodsIds := mapSlice[FormularyGood, interface{}](
		goods,
		func(o FormularyGood, index int) interface{} { return o.ID },
	)

	var event Event = Event{
		EntityId: goodsIds,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Created_Many,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()

	jsondata, _ := json.Marshal(goods)
	w.Write([]byte(jsondata))
}

func createManyGoods(goods []FormularyGood) ([]FormularyGood, error) {
	inserts := make([]interface{}, 0)
	session, err := findActiveSession()
	var activeSessionId interface{}

	if err != nil && err != mongo.ErrNoDocuments {
		log.Printf("Error while searching for active session, err=%v", err)
		return nil, err
	} else if err == nil {
		activeSessionId = session.Id
	}

	for _, _good := range goods {
		good := _good.ToGood()
		good.Changes = make([]GoodChange, 0)
		good.Changes = append(good.Changes, GoodChange{
			Condition:  _good.Condition,
			SaleValue:  good.PurchaseValue,
			SessionId:  activeSessionId,
			Reason:     GoodChangeReason_Created,
			At:         time.Now(),
			CountDelta: good.Count,
			Deleted:    _good.Deleted,
		})
		inserts = append(inserts, good)
	}

	opts := options.InsertMany().SetOrdered(true)
	result, err := database.Goods.InsertMany(database.Ctx, inserts, opts)
	if err != nil {
		log.Printf("createManyGoods() Error while inserting goods, err=[%v]", err)
		return nil, nil
	}

	for idx, _id := range result.InsertedIDs {
		goods[idx].ID = _id
	}
	return goods, nil
}

func handleCreateOneGood(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("handleCreateOneGood() => Errors lors de la lecture du corps de la requette"))
		log.Print("handleCreateOneGood() => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var good FormularyGood

	err = json.Unmarshal(body, &good)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	err = good.save(good.Condition)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("handleCreateOneGood () => Error while creating good"))
		log.Print("handleCreateOneGood () => Error while creating good", err)
		return
	}

	var event Event = Event{
		EntityId: good.ID,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Created,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()

	jsondata, _ := json.Marshal(good)
	w.Write([]byte(jsondata))
}

func DeleteGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodDelete) {
		return
	}

	goodId := mux.Vars(r)["id"]
	err := deleteGood(goodId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("DeleteGoodHandler() => Error while deleting good"))
		log.Print("DeleteGoodHandler() => Error while deleting good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)

	var event Event = Event{
		EntityId: goodId,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Deleted,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()
}

func UpdateGoodHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPatch) {
		return
	}

	goodId := mux.Vars(r)["id"]

	body, err := io.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" UpdateGoodHandler () => Errors lors de la lecture du corps de la requette"))
		log.Print(" UpdateGoodHandler () => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var request GoodUpdateRequest

	err = json.Unmarshal(body, &request)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if _, err := request.Update(goodId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("UpdateGoodHandler() => Error while Updating good"))
		log.Print("UpdateGoodHandler() => Error while Updating good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)

	var event Event = Event{
		EntityId: goodId,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Updated,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()
}

func CreateGoodChangeHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}
	goodId := mux.Vars(r)["id"]

	data, err := io.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("CreateGoodChangeHandler() => Error while reading good from body"))
		log.Print("CreateGoodChangeHandler () => Error while reading good from body ")
		return
	}

	var goodChange GoodChange

	err = json.Unmarshal(data, &goodChange)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("CreateGoodChangeHandler() => Error while unmarsaling goodChange"))
		log.Print("CreateGoodChangeHandler () =>  Error while unmarsaling goodChange ")
		return
	}

	_, err = goodChange.addToGood(goodId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("CreateGoodChangeHandler() => Error while saving goodChange"))
		log.Print("CreateGoodChangeHandler () => Error while creating good", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)

	var event Event = Event{
		EntityId: goodId,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Updated,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()
}

func HandleGoodChangeOperation(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {
		DeleteGoodChangeHandler(w, r)
		return
	} else if r.Method == http.MethodPatch {
		UpdateGoodChangeHandler(w, r)
		return
	}

	utils.ReportWrongHttpMethod(w, r, r.Method)
}

func UpdateGoodChangeHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPatch) {
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("UpdateGoodChangeHandler () => Errors lors de la lecture du corps de la requette"))
		log.Print("UpdateGoodChangeHandler () => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var change GoodChange

	err = json.Unmarshal(body, &change)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	goodId := mux.Vars(r)["id"]
	sessionId := mux.Vars(r)["sessionId"]
	if err := UpdateGoodChange(goodId, sessionId, change); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("UpdateGoodChangeHandler () => Error while retrieving session goods"))
		log.Printf("UpdateGoodChangeHandler () => Error while retrieving session goods err=[%v]", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	var event Event = Event{
		EntityId: goodId,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Updated,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()
}

func DeleteGoodChangeHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodDelete) {
		return
	}

	goodId := mux.Vars(r)["id"]
	idSession := mux.Vars(r)["sessionId"]

	log.Printf("This is the sessonId  %s \n and the goodId %s", idSession, goodId)
	err := deleteGoodChange(goodId, idSession)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("deleteGoodChange() => Error while deleting []goodChange"))
		log.Print("deleteGoodChange() => Error while deleting []goodChange", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)

	var event Event = Event{
		EntityId: goodId,
		At:       time.Now(),
		Entity:   Entities_Good,
		Action:   EventOperation_Updated,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()
}

func handleUnmarshallingError(err string, w http.ResponseWriter) {
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("Error while unmurshaling resquestBody"))
	log.Print("Error while unmurshaling resquestBody", err)
}

func deleteGoodChange(goodId string, idSession string) error {
	sessionId, err := primitive.ObjectIDFromHex(idSession)
	if err != nil {
		return err
	}

	goodHexId, err := primitive.ObjectIDFromHex(goodId)
	if err != nil {
		return err
	}

	_, err = database.Goods.UpdateOne(database.Ctx,
		primitive.M{"_id": goodHexId, "changes.sessionId": sessionId},
		primitive.M{"$set": primitive.M{
			"changes.$.deleted": true,
			"deleted":           true,
		}},
	)

	if err != nil {
		return err
	}
	return nil
}

func (change *GoodChange) addToGood(id string) (string, error) {
	hexId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}

	session, err := findActiveSession()
	if err != nil {
		log.Printf("Error while getting session activate, error=%v", err)
		return "", err
	}

	change.SessionId = session.Id
	change.Reason = GoodChangeReason_Modified
	change.At = time.Now()

	_, err = database.Goods.UpdateOne(database.Ctx,
		primitive.M{"_id": hexId},
		primitive.M{
			"$push": primitive.M{
				"changes": change,
			},
		},
	)
	if err != nil {
		log.Printf("error inserting good, %v\n", err)
		return "", err
	}
	return "", nil
}

func deleteGood(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	operations := []mongo.WriteModel{
		mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": bsonId}).
			SetUpdate(bson.M{"$set": bson.M{"deleted": true}}),
	}

	activeSession, err := findActiveSession()
	if err != nil {
		log.Printf("deleteGood(): Cannot find active session")
	} else {
		operations = append(
			operations,
			mongo.NewUpdateManyModel().
				SetFilter(bson.M{"_id": bsonId, "changes.sessionId": activeSession.Id}).
				SetUpdate(bson.M{"$set": bson.M{"changes.$.deleted": true}}),
		)
	}

	if _, err = database.Goods.BulkWrite(database.Ctx, operations); err != nil {
		log.Printf("deleteGood(): Error while deleting good, error=%v", err)
		return err
	}

	return nil
}

func getOneGood(id string) (Good, error) {
	hexId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return Good{}, err
	}
	var good Good

	result := database.Goods.FindOne(ctx, bson.M{
		"_id": hexId,
	})

	err = result.Decode(&good)
	if err != nil {
		return good, err
	}

	return good, nil
}

func getGoods(pagination PageQueryParams) (GetGoodResponse, error) {
	response := GetGoodResponse{
		Goods: make([]Good, 0),
		Total: 0,
	}
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.skip
	opts.Limit = &pagination.count
	result, err := database.Goods.Find(database.Ctx, bson.M{"deleted": bson.M{"$ne": true}}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return response, nil
		}
		return response, err
	}

	count, err := database.Goods.CountDocuments(database.Ctx, bson.M{"deleted": bson.M{"$ne": true}})
	if err != nil {
		return response, err
	}
	response.Total = count

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &response.Goods)
	if err != nil {
		return response, err
	}

	return response, nil
}

func (good *GoodUpdateRequest) Update(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}

	operations := []mongo.WriteModel{
		mongo.NewUpdateOneModel().
			SetFilter(primitive.M{"_id": bsonId}).
			SetUpdate(primitive.M{"$set": good}),
	}

	if good.SessionId != "" {
		hexSessionId, err := primitive.ObjectIDFromHex(good.SessionId)
		if err != nil {
			return "", err
		}

		operations = append(
			operations,
			mongo.NewUpdateOneModel().
				SetFilter(primitive.M{"_id": bsonId, "changes.sessionId": hexSessionId}).
				SetUpdate(primitive.M{"$set": primitive.M{
					"changes.$.saleValue":  good.Change.SaleValue,
					"changes.$.condition":  good.Change.Condition,
					"changes.$.countDelta": good.Change.CountDelta,
				}}),
		)
	}

	if _, err = database.Goods.BulkWrite(database.Ctx, operations); err != nil {
		log.Printf("Error while updating good, error=%v", err)
		return "", err
	}

	return "", nil
}

func (good *Good) save(condition string) error {

	var sessionId interface{}
	activeSession, err := findActiveSession()
	if err == nil {
		sessionId = activeSession.Id
	}

	good.Changes = make([]GoodChange, 0)
	good.Changes = append(good.Changes, GoodChange{
		Condition: condition,
		SaleValue: good.PurchaseValue,
		SessionId: sessionId,
		Reason:    GoodChangeReason_Created,
		At:        time.Now(),
		Deleted:   false,
	})

	result, err := database.Goods.InsertOne(database.Ctx, good)
	if err != nil {
		log.Printf("error inserting good, %v\n", err)
		return err
	}

	good.ID = result.InsertedID
	return nil
}

func findGoodToChange(id string) (Good, error) {
	hexId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return Good{}, err
	}

	var doc Good

	result := database.Goods.FindOne(ctx, bson.M{
		"_id": hexId,
	})

	err = result.Decode(&doc)
	if err != nil {

	}
	return doc, err
}

func findActiveSession() (Session, error) {
	var doc Session

	result := database.Sessions.FindOne(ctx, bson.M{
		"active": true,
	})

	err := result.Decode(&doc)
	if err != nil {

	}
	return doc, err
}

func UpdateGoodChange(goodId string, sessionId string, change GoodChange) error {
	hexSessionId, err := primitive.ObjectIDFromHex(sessionId)
	if err != nil {
		return err
	}

	goodHexId, err := primitive.ObjectIDFromHex(goodId)
	if err != nil {
		return err
	}

	_, err = database.Goods.UpdateOne(database.Ctx,
		primitive.M{"_id": goodHexId, "changes.sessionId": hexSessionId},
		primitive.M{
			"$set": primitive.M{
				"changes.$.saleValue": change.SaleValue,
				"changes.$.condition": change.Condition,
			},
		},
	)

	if err != nil {
		return err
	}

	return nil
}

func GetGoodById(goodId string) (Good, error) {
	var good Good
	hexId, err := primitive.ObjectIDFromHex(goodId)
	if err != nil {
		return Good{}, err
	}
	result := database.Goods.FindOne(database.Ctx,
		bson.M{
			"_id": hexId,
		})

	err = result.Decode(&good)
	if err != nil {
		return Good{}, err
	}

	return good, nil
}
