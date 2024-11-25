package rest

import (
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	GoodChangeReason_Created  = "created"
	GoodChangeReason_Modified = "modified"
	GoodChangeReason_Deleted  = "deleted"
)

type User struct {
	Id           interface{}    `bson:"_id,omitempty" json:"id"`
	FirstName    string         `bson:"fistname,omitempty" json:"firstname"`
	LastName     string         `bson:"lastname,omitempty" json:"lastname"`
	MiddleName   string         `bson:"middlename,omitempty" json:"middlename"`
	Notification []Notification `bson:"notification,omitempty" json:"notification"`
	Condition    string         `bson:"condition,omitempty" json:"condition"`
}

type Good struct {
	ID            interface{}  `bson:"_id,omitempty" json:"id"`
	Name          string       `bson:"name,omitempty" json:"name"`
	Description   string       `bson:"description,omitempty" json:"description"`
	Count         int32        `bson:"count,omitempty" json:"count"`
	PurchaseValue float64      `bson:"purchaseValue,omitempty" json:"purchaseValue"`
	Changes       []GoodChange `bson:"changes,omitempty" json:"changes"`
	Deleted       bool         `bson:"deleted,omitempty" json:"deleted"`
}

type GoodUpdateRequest struct {
	Count     int32      `bson:"count,omitempty" json:"count"`
	Change    GoodChange `bson:"-" json:"change"`
	SessionId string     `bson:"-" json:"sessionId"`
}

type GoodChange struct {
	Id         interface{} `bson:"_id,omitempty" json:"id"`
	Condition  string      `bson:"condition," json:"condition"`
	SaleValue  float64     `bson:"saleValue,omitempty" json:"saleValue"`
	SessionId  interface{} `bson:"sessionId,omitempty" json:"sessionId"`
	Reason     string      `bson:"reason,omitempty" json:"reason"`
	At         time.Time   `bson:"time,omitempty" json:"time"`
	CountDelta int32       `bson:"countDelta,omitempty" json:"countDelta"`
	Deleted    bool        `bson:"deleted,omitempty" json:"deleted"`
}

type SessionGoodsLookupResponse struct {
	SessionId interface{} `bson:"_id" json:"sessionId"`
	Goods     []Good      `bson:"goods" json:"goods"`
}

type FormularyGood struct {
	Good      `bson:"-"`
	Condition string
}

type Session struct {
	Id        interface{} `bson:"_id,omitempty" json:"id"`
	StartDate time.Time   `bson:"startDate,omitempty" json:"startDate"`
	EndDate   time.Time   `bson:"endDate,omitempty" json:"endDate"`
	Author    interface{} `bson:"author,omitempty" json:"author"`
	Active    bool        `bson:"active" json:"active"`
}

type SessionWithGoods struct {
	Session
	Goods []Good `bson:"goods,omitempty"`
}

type Notification struct {
	Id          interface{} `bson:"_id,omitempty" json:"id"`
	Title       string      `bson:"title,omitempty" json:"title"`
	Description string      `bson:"description,omitempty" json:"description"`
}

func checkMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		reportWrongHttpMethod(w, r, method)
		return false
	}
	return true
}

func reportWrongHttpMethod(w http.ResponseWriter, r *http.Request, method string) {
	log.Printf("Vous tentez d'utiliser un endpoint avec une méthode inapropriée %s", r.Method)
	w.WriteHeader(http.StatusMethodNotAllowed)
	w.Write([]byte("L'endpoint invalide"))
}

func ConvertStringToPrimitiveOBjectId(id string) (primitive.ObjectID, error) {
	var hexId primitive.ObjectID

	if hexId, err := primitive.ObjectIDFromHex(id); err != nil {
		return hexId, err
	}

	return hexId, nil
}
