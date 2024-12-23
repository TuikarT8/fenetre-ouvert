package tplt

import (
	"html/template"
	"log"
	"net/http"
)

func RenderTemplate(w http.ResponseWriter, name string, data interface{}) error {
	tmpl, err := template.ParseFiles("./api/rest/" + name + ".html")
	if err != nil {
		log.Printf("HandlePrintLabel() => Errors while parsing file err=[%v]", err)
		return err
	}

	if err := tmpl.Execute(w, data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("HandlePrintLabel() => Errors while executing data err=[%v]", err)
		return err
	}
	return nil
}
