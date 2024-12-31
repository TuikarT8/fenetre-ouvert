package rest

import (
	"regexp"
	"time"

	"github.com/golang-jwt/jwt"
)

const (
	GoodChangeReason_Created  = "created"
	GoodChangeReason_Modified = "modified"
	GoodChangeReason_Deleted  = "deleted"
)

const (
	GoodCondition_Bien        = "bien"
	GoodCondition_Excellent   = "excellent"
	GoodCondition_Mauvais     = "mauvais"
	GoodCondition_TresMauvais = "tres-mauvais"
)

type User struct {
	Id           interface{}    `bson:"_id,omitempty" json:"id"`
	FirstName    string         `bson:"fistname,omitempty" json:"firstname"`
	LastName     string         `bson:"lastname,omitempty" json:"lastname"`
	EmailAddress string         `bson:"emailAddress,omitempty" json:"emailAddress"`
	Password     string         `bson:"password,omitempty" json:"password"`
	MiddleName   string         `bson:"middlename,omitempty" json:"middlename"`
	Notification []Notification `bson:"notification,omitempty" json:"notification"`
	Condition    string         `bson:"condition,omitempty" json:"condition"`
	Address      string         `bson:"address,omitempty" json:"address"`
	Deleted      bool           `bson:"deleted,omitempty" json:"deleted"`
}

type ValidJwToken struct {
	Valid bool `json:"valid"`
}

type Good struct {
	ID            interface{}  `bson:"_id,omitempty" json:"id"`
	Name          string       `bson:"name,omitempty" json:"name"`
	Description   string       `bson:"description,omitempty" json:"description"`
	Count         int32        `bson:"count,omitempty" json:"count"`
	PurchaseValue float64      `bson:"purchaseValue,omitempty" json:"purchaseValue"`
	Changes       []GoodChange `bson:"changes,omitempty" json:"changes"`
	Deleted       bool         `bson:"deleted,omitempty" json:"deleted"`
	StringId      string       `bson:"stringId,omitempty" json:"StringId"`
}

type GoodUpdateRequest struct {
	Count     int32      `bson:"count,omitempty" json:"count"`
	Change    GoodChange `bson:"-" json:"change"`
	SessionId string     `bson:"-" json:"sessionId"`
}

type GetGoodResponse struct {
	Goods []Good `json:"goods"`
	Total int64  `json:"total"`
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
	SessionId         interface{} `bson:"_id" json:"sessionId"`
	Goods             []Good      `bson:"goods" json:"goods"`
	GoodsNotInSession []Good      `json:"goodsNotInSession"`
}

type FormularyGood struct {
	Good      `bson:"-"`
	Condition string
}

type Session struct {
	Id        interface{} `bson:"_id,omitempty" json:"id"`
	StartDate time.Time   `bson:"startDate,omitempty" json:"startDate,omitempty"`
	EndDate   time.Time   `bson:"endDate,omitempty" json:"endDate,omitempty"`
	Author    interface{} `bson:"author,omitempty" json:"author"`
	Active    bool        `bson:"active" json:"active"`
	CloseDate time.Time   `bson:"closeDate,omitempty" json:"closeDate,omitempty"`
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

type PermissionSchema struct {
	Id             interface{}         `bson:"_id,omitempty" json:"id"`
	Name           string              `bson: "name, omitempty" json:"id"`
	AttributionMap map[string][]string `bson: "attributionMap, omitempty" json:"attributionMap"`
}

type AuthToken struct {
	User User
	jwt.StandardClaims
}

func (good *FormularyGood) ToGood() Good {
	return good.Good
}

func (user *User) verify() map[string]string {
	errs := make(map[string]string)
	if len(user.FirstName) < 3 {
		errs["firstName"] = "The length of the first-name should not be lesser than 2"
	}

	if len(user.LastName) < 3 {
		errs["lastName"] = "The length of the first-name should not be lesser than 2"
	}

	if matched, _ := regexp.MatchString(`[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+`, user.EmailAddress); !matched && user.EmailAddress != "" {
		errs["emailAddress"] = "value should be of the form  xxxxx@xxxxxx.xx"
	}

	if matched, _ := regexp.MatchString(`[a-zA-Z]{10,}`, user.Password); !matched && user.Password != "" {
		errs["password"] = "value should be of the form  xxXXxxx123"
	}

	return errs
}
