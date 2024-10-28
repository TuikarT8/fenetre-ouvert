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

type GoodChange struct {
	Condition string      `bson:"condition,state" json:"condition"`
	SaleValue float32     `bson:"saleValue,omitempty" json:"saleValue"`
	SessionId interface{} `bson:"SessionId,omitempty" json:"SessionId"`
	Reason    string      `bson:"reason" json:"reason"`
	At        time.Time   `bson:"time" json:"time"`
}

type User struct {
	Id           interface{}    `bson:"_id,omitempty" json:"id"`
	FirstName    string         `bson:"fistname ,omitempty" json:"firstname"`
	LastName     string         `bson:"lastname ,omitempty" json:"lastname"`
	MiddleName   string         `bson:"middlename ,omitempty" json:"middlename"`
	Notification []Notification `bson:"notification ,omitempty" json:"notification"`
	Condition    string         `bson:"condition,omitempty" json:"condition"`
}

type Good struct {
	ID            interface{}  `bson:"_id,omitempty" json:"id"`
	Name          string       `bson:"name,omitempty" json:"name"`
	Description   string       `bson:"description,omitempty" json:"description"`
	Count         string       `bson:"count,omitempty" json:"count"`
	PurchaseValue float32      `bson:"purchaseValue,omitempty" json:"purchaseValue"`
	Changes       []GoodChange `bson:"changes ,omitempty" json:"changes"`
}

type FormularyGood struct {
	Good
	Condition string
}

type Session struct {
	Id        interface{} `bson:"_id,omitempty" json:"id"`
	StartTime time.Time   `bson:"starttime ,omitempty" json:"starttime"`
	EndTime   time.Time   `bson:"endtime ,omitempty" json:"endtime"`
	Author    string      `bson:"author ,omitempty" json:"author"`
	Active    bool        `bson:"active" json:"active"`
}

type Notification struct {
	Id          interface{} `bson:"_id,omitempty" json:"id"`
	Title       string      `bson:"title ,omitempty" json:"title"`
	Description string      `bson:"description ,omitempty" json:"description"`
}

func checkMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		log.Print("Vous tentez d'utiliser un Endpoint avec la methode Inaproprie", r.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("L'endpoint invalid"))
		return false
	}

	return true
}

func ConvertStringToPrimitiveOBjectId(id string) (primitive.ObjectID, error) {
	var hexId primitive.ObjectID

	if hexId, err := primitive.ObjectIDFromHex(id); err != nil {
		return hexId, err
	}

	return hexId, nil
}
