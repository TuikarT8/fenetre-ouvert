package rest

import (
	"time"
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
	Code          string       `bson:"code,omitempty" json:"code"`
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

func (good *FormularyGood) ToGood() Good {
	return good.Good
}
